const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Lấy token từ cookie hoặc từ header Authorization
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);
  console.log("👉 Token nhận được từ client:", token); // log token

  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    console.log("👉 Token decode thành công:", decoded); // log payload
    // Gán thông tin user vào req
    req.userId = decoded.id || decoded._id || decoded.userId;
    req.userRole = decoded.role || "user";
    req.user = decoded;

    next();
  } catch (error) {
    console.error("❌ Verify token thất bại:", error.message); // log lỗi

    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

module.exports = authMiddleware;
