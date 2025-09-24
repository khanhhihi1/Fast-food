const userModel = require("../model/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const otpModel = require('../model/otpModel.js'); 

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  updateUserByAdmin,
  lockUser,
  getUserInfo,
  getAllUser,
  patchUserByAdmin,
  changePassword,
  sendOTPForRegister,
  verifyOTPAndRegister,
  findOrCreateGoogleUser,
};

// Helper
function isValidEmail(email) {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dongkhanh88888@gmail.com', // Email gửi
    pass: 'hgut emlf kctp poxj', // App Password nếu dùng Gmail
  },
});

// Google login: Tìm hoặc tạo user
async function findOrCreateGoogleUser(profile) {
  try {
    if (!profile.id || !profile.emails || !profile.emails[0]) {
      throw new Error("Thông tin Google profile không đầy đủ (thiếu ID hoặc email)");
    }

    const googleId = profile.id;
    const email = profile.emails[0].value;

    console.log(`🔍 Tìm user với email: ${email} hoặc googleId: ${googleId}`);

    // Bước 1: Tìm user by googleId (ưu tiên, vì unique)
    let user = await userModel.findOne({ googleId });

    if (user) {
      console.log(`✅ Tìm thấy user by googleId: ${user._id}`);
      return generateTokenResponse(user);
    }

    // Bước 2: Nếu không, tìm by email
    user = await userModel.findOne({ email });

    if (user) {
      // Nếu user tồn tại by email nhưng googleId undefined/null, update googleId (atomic để tránh race condition)
      if (!user.googleId) {
        console.log(`🔄 User tồn tại by email (${user._id}), update googleId từ null sang ${googleId}`);
        user = await userModel.findOneAndUpdate(
          { email, $or: [{ googleId: null }, { googleId: { $exists: false } }] },  // Điều kiện: email khớp VÀ googleId null/undefined
          { 
            googleId: googleId,
            name: profile.displayName || user.name  // Update name nếu có
          },
          { new: true }  // Return document sau update
        ).select("-password");

        if (!user) {
          throw new Error("Lỗi update googleId (user không tồn tại sau update)");
        }
      } else {
        // Nếu googleId đã set nhưng khác profile.id, có thể là conflict (cảnh báo, nhưng return)
        if (user.googleId !== googleId) {
          console.warn(`⚠️ Conflict googleId: User ${user._id} có googleId ${user.googleId}, nhưng profile là ${googleId}`);
        }
      }

      console.log(`✅ Return user tồn tại by email: ${user._id}`);
      return generateTokenResponse(user);
    }

    // Bước 3: Tạo user mới
    console.log(`🆕 Tạo user mới với googleId: ${googleId}, email: ${email}`);
    user = new userModel({
      username: profile.id, // Sử dụng Google ID làm username (hoặc tùy chỉnh)
      name: profile.displayName || "Google User",
      email: email,
      password: null, // Không cần password cho Google user
      role: "user",
      status: "active",
      isLocked: false,
      deletedAt: null,
      googleId: googleId,  // Đảm bảo không null
    });

    await user.save();
    console.log(`✅ Tạo user mới thành công: ${user._id}`);

    return generateTokenResponse(user);
  } catch (error) {
    console.error("❌ Lỗi findOrCreateGoogleUser:", error);
    throw new Error(error.message || "Lỗi xử lý Google login");
  }
}

// Helper: Tạo token và response
function generateTokenResponse(user) {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret_key", {
    expiresIn: "1d",
  });

  return { 
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    }, 
    token 
  };
}

// Hàm tạo OTP ngẫu nhiên
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
}

// Bước 1: Gửi OTP khi đăng ký
async function sendOTPForRegister(data) {
  try {
    const { username, name, email, password, confirmPassword, phone } = data;

    // Giữ nguyên kiểm tra dữ liệu như cũ
    if (!username || !name || !email || !password || !confirmPassword || !phone) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    if (!/^(0[0-9]{9})$/.test(phone)) {
      throw new Error("Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)");
    }
    if (!isValidEmail(email)) {
      throw new Error("Email không hợp lệ");
    }
    if (password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }
    if (password !== confirmPassword) {
      throw new Error("Mật khẩu không khớp");
    }

    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new Error("Tên đăng nhập hoặc email đã tồn tại");
    }

    // Tạo OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

    // Lưu OTP
    await otpModel.create({ email, otp, expiresAt });

    // Gửi email
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Mã OTP Đăng Ký Tài Khoản Fast-Food',
      text: `Mã OTP của bạn là: ${otp}. Mã hết hạn sau 5 phút. Cảm ơn bạn đã tạo tài khoản`,
    });

    // Trả về dữ liệu tạm (sẽ dùng để hoàn tất sau)
    return { tempData: { username, name, email, phone, password: await bcrypt.hash(password, 10) }, message: 'Đã gửi OTP đến email' };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Bước 2: Xác thực OTP và hoàn tất đăng ký
async function verifyOTPAndRegister(email, otp, tempData) {
  try {
    const otpRecord = await otpModel.findOne({ email, otp });
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new Error('OTP không hợp lệ hoặc đã hết hạn');
    }

    // Tạo user 👈 KHÔNG set googleId (để undefined)
    const newUser = new userModel({
      username: tempData.username,
      name: tempData.name,
      email: tempData.email,
      password: tempData.password,
      role: "user",
      phone: tempData.phone,
      status: "active",
      isLocked: false,
      deletedAt: null,
      // googleId: undefined (không set, để schema handle)
    });

    const result = await newUser.save();

    // Xóa OTP sau khi dùng
    await otpModel.deleteOne({ _id: otpRecord._id });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Đăng ký (cũ, không dùng OTP - giữ để tương thích)
async function registerUser(data) {
  try {
    const { username, name, email, password, confirmPassword, phone } = data;

    if (!username || !name || !email || !password || !confirmPassword || !phone) {
      throw new Error("Thiếu thông tin bắt buộc");
    }
    if (!/^(0[0-9]{9})$/.test(phone)) {
      throw new Error("Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng 0)");
    }
    if (!isValidEmail(email)) {
      throw new Error("Email không hợp lệ");
    }
    if (password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }
    if (password !== confirmPassword) {
      throw new Error("Mật khẩu không khớp");
    }

    const existingUser = await userModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new Error("Tên đăng nhập hoặc email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user",
      status: "active",
      isLocked: false,
      deletedAt: null,
      // googleId: undefined (không set)
    });

    return await newUser.save();
  } catch (error) {
    throw new Error(error.message);
  }
}

// Đăng nhập
async function loginUser(data) {
  try {
    const { username, password } = data;

    if (!username || !password) {
      throw new Error("Thiếu tên đăng nhập hoặc mật khẩu");
    }

    const user = await userModel.findOne({ username });

    if (!user || user.status !== "active" || user.isLocked) {
      throw new Error("Tài khoản không tồn tại, bị khóa, hoặc đã bị xóa");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "1d",
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      token,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Cập nhật thông tin người dùng (self-update)
async function updateUser(id, data) {
  try {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    const updateData = {};

    if (data.name) updateData.name = data.name;
    if (data.phone) {
      if (!/^(0[0-9]{9})$/.test(data.phone)) {
        throw new Error("Số điện thoại không hợp lệ");
      }
      updateData.phone = data.phone;
    }
    if (data.email) {
      if (!isValidEmail(data.email)) {
        throw new Error("Email không hợp lệ");
      }
      updateData.email = data.email;
    }
    if (data.password) {
      if (data.password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // 👈 Xử lý thêm địa chỉ mới
    if (data.addAddress) {
      user.addresses.push({
        ...data.addAddress,
        isDefault: user.addresses.length === 0 // Mặc định nếu là đầu tiên
      });
    }

    // 👈 Xử lý cập nhật địa chỉ
    if (data.updateAddress) {
      const { index, ...addr } = data.updateAddress;
      if (index >= 0 && index < user.addresses.length) {
        user.addresses[index] = addr;
      } else {
        throw new Error("Index địa chỉ không hợp lệ");
      }
    }

    // 👈 Xử lý xóa địa chỉ
    if (data.deleteAddress !== undefined) {
      const index = data.deleteAddress;
      if (index >= 0 && index < user.addresses.length) {
        user.addresses.splice(index, 1);
      } else {
        throw new Error("Index địa chỉ không hợp lệ");
      }
    }

    // 👈 Xử lý set default
    if (data.setDefaultAddress !== undefined) {
      const index = data.setDefaultAddress;
      if (index >= 0 && index < user.addresses.length) {
        user.addresses = user.addresses.map((addr, i) => ({
          ...addr,
          isDefault: i === index
        }));
      } else {
        throw new Error("Index địa chỉ không hợp lệ");
      }
    }

    await user.save();

    const result = await userModel.findById(id).select("-password");
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Admin cập nhật toàn bộ thông tin người dùng
async function updateUserByAdmin(id, data) {
  try {
    const user = await userModel.findById(id);
    if (!user) throw new Error("Không tìm thấy người dùng");

    const { name, email, role, status, isLocked, phone, address } = data; // 👈 Thêm phone và address
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) {
      if (!/^(0[0-9]{9})$/.test(phone)) {
        throw new Error("Số điện thoại không hợp lệ");
      }
      updateData.phone = phone;
    }
    if (address) updateData.address = address; // 👈 Hỗ trợ address
    if (email && isValidEmail(email)) updateData.email = email;
    if (role && ["user", "staff", "admin"].includes(role))
      updateData.role = role;
    if (status && ["active", "banned", "deleted"].includes(status)) {
      updateData.status = status;
      if (status === "deleted") {
        updateData.deletedAt = new Date();
      }
    }
    if (typeof isLocked === "boolean") updateData.isLocked = isLocked;

    const result = await userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-password");

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
// Soft lock người dùng (chặn tạm thời)
async function lockUser(id) {
  try {
    const user = await userModel.findById(id);
    if (!user) throw new Error("Không tìm thấy người dùng");

    user.isLocked = true;
    await user.save();

    return { message: "Người dùng đã bị khóa tạm thời" };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Lấy thông tin người dùng
async function getUserInfo(id) {
  try {
    const user = await userModel.findById(id).select("-password");
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

// Lấy danh sách người dùng chưa bị xóa
async function getAllUser() {
  try {
    const users = await userModel
      .find({ status: { $ne: "deleted" } })
      .select("-password");
    return users;
  } catch (error) {
    throw new Error("Không thể lấy danh sách người dùng!");
  }
}

// Cập nhật trạng thái (chỉ sửa một vài trường)
async function patchUserByAdmin(id, data) {
  try {
    const user = await userModel.findById(id);
    if (!user) throw new Error("Không tìm thấy người dùng!");

    // Không cho chỉnh sửa nếu là admin
    if (
      user.role === "admin" &&
      (data.role || data.status || typeof data.isLocked !== "undefined")
    ) {
      throw new Error("Không thể cập nhật người dùng có vai trò admin");
    }

    const updates = {};

    if (data.role && ["user", "staff"].includes(data.role)) {
      updates.role = data.role;
    }

    if (data.status && ["active", "banned", "pending"].includes(data.status)) {
      updates.status = data.status;
    }

    if (typeof data.isLocked === "boolean") {
      updates.isLocked = data.isLocked;
    }

    const result = await userModel
      .findByIdAndUpdate(id, updates, { new: true })
      .select("-password");

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function changePassword(id, data) {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = data;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      throw new Error("Thiếu thông tin bắt buộc: mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu mới");
    }

    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error("Mật khẩu mới và xác nhận không khớp");
    }

    const user = await userModel.findById(id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu cũ không đúng");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return { message: "Mật khẩu đã được thay đổi thành công" };
  } catch (error) {
    throw new Error(error.message);
  }
}