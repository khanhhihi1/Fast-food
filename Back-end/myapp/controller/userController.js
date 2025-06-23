const userModel = require("../model/userModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
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

    // Kiểm tra đầu vào
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

    // Kiểm tra tài khoản đã tồn tại chưa
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error("Tên đăng nhập hoặc email đã tồn tại");
    }

    // Mã hoá mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới (không lưu confirmPassword)
    const newUser = new userModel({
      username,
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const result = await newUser.save();
    return result;
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
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
    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    const token = jwt.sign({ id: user._id }, "secret_key", { expiresIn: "1d" });

    return { user, token };
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    throw new Error(error.message);
  }
}

// Cập nhật người dùng
async function updateUser(id, data) {
  try {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    const { name, email, password } = data;

    const updateData = {
      name: name || user.name,
      email: email || user.email,
    };

    if (email && !isValidEmail(email)) {
      throw new Error("Email không hợp lệ");
    }

    if (password) {
      if (password.length < 6) {
        throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    return result;
  } catch (error) {
    console.error("Lỗi cập nhật người dùng:", error.message);
    throw new Error(error.message);
  }
}

// Xoá người dùng
async function deleteUser(id) {
  try {
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng để xoá");
    }
    return user;
  } catch (error) {
    console.error("Lỗi xoá người dùng:", error.message);
    throw new Error(error.message);
  }
}
