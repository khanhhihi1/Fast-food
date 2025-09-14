const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

async function isAdminMiddleware(req, res, next) {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    // Lấy user từ DB
    const user = await userModel.findById(req.userId);

    if (!user || user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Tài khoản không tồn tại hoặc đã bị khóa" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới được phép thực hiện hành động này" });
    }

    next();
  } catch (error) {
    console.error("❌ isAdminMiddleware error:", error.message);
    return res.status(500).json({ message: "Lỗi hệ thống khi kiểm tra quyền admin" });
  }
}

module.exports = isAdminMiddleware;
