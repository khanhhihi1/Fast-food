function isAdmin(req, res, next) {
  if (req.userRole === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này" });
  }
}

module.exports = isAdmin;