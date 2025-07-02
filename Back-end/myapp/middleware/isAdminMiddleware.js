const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

async function isAdminMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, "secret_key");
    const userId = decoded._id || decoded.id || decoded.userId;

    const user = await userModel.findById(userId);
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

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
}

module.exports = isAdminMiddleware;
