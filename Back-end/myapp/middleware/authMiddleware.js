const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, "secret_key");

    // ✅ Gán cả id và role
    req.userId = decoded._id || decoded.id || decoded.userId;
    req.userRole = decoded.role || "user"; // mặc định user nếu không có
    req.user = decoded; // hoặc gán toàn bộ nếu cần

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

module.exports = authMiddleware;
