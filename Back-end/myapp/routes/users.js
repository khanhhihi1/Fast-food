const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");
const authMiddleware = require("../middleware/authMiddleware");
const isAdminMiddleware = require("../middleware/isAdminMiddleware");
const jwt = require("jsonwebtoken");

const passport = require('passport'); // 👈 thêm dòng này

// Đăng ký người dùng
router.post("/register/send-otp", async (req, res) => {
  try {
    const result = await userController.sendOTPForRegister(req.body);
    res.status(200).json({ status: true, ...result });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

router.post("/register/verify-otp", async (req, res) => {
  const { email, otp, tempData } = req.body;
  try {
    const result = await userController.verifyOTPAndRegister(email, otp, tempData);
    res.status(201).json({ status: true, result, message: "Đăng ký thành công" });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});
//google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/users/login' }), // Sửa failureRedirect nếu cần
  async (req, res) => {
    try {
      console.log('Callback success, req.user:', req.user);
      // req.user là user từ Passport
      const  token  = jwt.sign({ id: req.user._id, role: req.user.role }, process.env.JWT_SECRET || "secret_key", { expiresIn: "1d" });
      // Set cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: false, // true cho production
        sameSite: "lax",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      // Redirect dựa trên role
      const redirectUrl = req.user.role === "admin" ? "/admin" : "/";
      res.redirect(`http://localhost:3000${redirectUrl}`);
    } catch (error) {
      console.error('Callback error:', error); // 👈 Thêm log
      res.redirect('/users/login?error=auth_failed');
    }
  }
);
// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { user, token } = await userController.loginUser(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // dùng true nếu deploy HTTPS
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: true,
      result: { user },
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    res.status(401).json({ status: false, message: error.message });
  }
});

// Đăng xuất
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    path: "/",
  });
  res.status(200).json({ status: true, message: "Đăng xuất thành công" });
});

// Người dùng tự cập nhật thông tin cá nhân
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const result = await userController.updateUser(req.params.id, req.body);
    res
      .status(200)
      .json({ status: true, result, message: "Cập nhật thành công" });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Admin cập nhật người dùng (role, status, isLocked,...)
router.put("/admin/update/:id", isAdminMiddleware, async (req, res) => {
  try {
    const result = await userController.updateUserByAdmin(
      req.params.id,
      req.body
    );
    res
      .status(200)
      .json({ status: true, result, message: "Admin đã cập nhật người dùng" });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Khóa tạm thời người dùng (lock logic)
router.patch("/lock/:id", isAdminMiddleware, async (req, res) => {
  try {
    const result = await userController.lockUser(req.params.id);
    res
      .status(200)
      .json({ status: true, result, message: "Đã khóa tạm thời người dùng" });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Lấy thông tin cá nhân
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await userController.getUserInfo(req.userId);
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const result = await userController.changePassword(req.userId, req.body);
    res
      .status(200)
      .json({ status: true, result, message: "Thay đổi mật khẩu thành công" });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});
// Lấy danh sách người dùng (admin xem được tất cả trừ đã xóa)
router.get("/", isAdminMiddleware, async (req, res) => {
  try {
    const result = await userController.getAllUser();
    res.status(200).json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: "Lỗi hệ thống" });
  }
});

// Cập nhật nhanh status / isLocked / role (admin sử dụng dropdown)
router.patch("/:id", isAdminMiddleware, async (req, res) => {
  try {
    const result = await userController.patchUserByAdmin(
      req.params.id,
      req.body
    );
    res.status(200).json({
      status: true,
      result,
      message: "Đã cập nhật thông tin người dùng",
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

module.exports = router;
