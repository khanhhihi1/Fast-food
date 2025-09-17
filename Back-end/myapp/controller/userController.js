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
//google
async function findOrCreateGoogleUser(profile) {
  try {
    let user = await userModel.findOne({ email: profile.emails[0].value });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = new userModel({
        username: profile.id, // Sử dụng Google ID làm username (hoặc tùy chỉnh, ví dụ: profile.emails[0].value.split('@')[0])
        name: profile.displayName,
        email: profile.emails[0].value,
        password: null, // Không cần password cho Google user
        role: "user",
        status: "active",
        isLocked: false,
        deletedAt: null,
        googleId: profile.id,
      });
      await user.save();
    }

    // Tạo token JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret_key", {
      expiresIn: "1d",
    });

    return { user, token };
  } catch (error) {
    throw new Error(error.message);
  }
}
// Hàm tạo OTP ngẫu nhiên
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chữ số
}

// Bước 1: Gửi OTP khi đăng ký
async function sendOTPForRegister(data) {
  try {
    const { username, name, email, password, confirmPassword } = data;

    // Giữ nguyên kiểm tra dữ liệu như cũ
    if (!username || !name || !email || !password || !confirmPassword) {
      throw new Error("Thiếu thông tin bắt buộc");
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
    return { tempData: { username, name, email, password: await bcrypt.hash(password, 10) }, message: 'Đã gửi OTP đến email' };
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

    // Tạo user
    const newUser = new userModel({
      username: tempData.username,
      name: tempData.name,
      email: tempData.email,
      password: tempData.password,
      role: "user",
      status: "active",
      isLocked: false,
      deletedAt: null,
    });

    const result = await newUser.save();

    // Xóa OTP sau khi dùng
    await otpModel.deleteOne({ _id: otpRecord._id });

    return result;
  } catch (error) {
    throw new Error(error.message);
  }
}
// Đăng ký
async function registerUser(data) {
  try {
    const { username, name, email, password, confirmPassword } = data;

    if (!username || !name || !email || !password || !confirmPassword) {
      throw new Error("Thiếu thông tin bắt buộc");
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

    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error("Tên đăng nhập hoặc email đã tồn tại");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      name,
      email,
      password: hashedPassword,
      role: "user",
      status: "active",
      isLocked: false,
      deletedAt: null,
    });

    const result = await newUser.save();
    return result;
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

    // Hợp nhất đoạn bị conflict
    const token = jwt.sign({ id: user._id, role: user.role },process.env.JWT_SECRET || "secret_key", {
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

    const { name, email, password } = data;
    const updateData = {};

    if (name) updateData.name = name;
    if (email) {
      if (!isValidEmail(email)) {
        throw new Error("Email không hợp lệ");
      }
      updateData.email = email;
    }

    if (password) {
      if (password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select("-password");

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

    const { name, email, role, status, isLocked } = data;
    const updateData = {};

    if (name) updateData.name = name;
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
