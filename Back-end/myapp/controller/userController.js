const userModel = require("../model/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  updateUserByAdmin,
  lockUser,
  getUserInfo,
  getAllUser,
  patchUserByAdmin,
};

// Helper
function isValidEmail(email) {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
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
    const token = jwt.sign({ id: user._id, role: user.role }, "secret_key", {
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
