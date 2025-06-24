const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");

// Đăng ký người dùng
// http://localhost:5000/users/register
router.post("/register", async (req, res) => {
  try {
    const data = req.body;
    const result = await userController.registerUser(data);
    return res
      .status(201)
      .json({ status: true, result, message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
});

// Đăng nhập
// POST http://localhost:5000/users/login
router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    const { user, token } = await userController.loginUser(data);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
    });

    return res.status(200).json({
      status: true,
      result: { user },
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    return res.status(401).json({ status: false, message: error.message });
  }
});

// Cập nhật thông tin người dùng
// PUT http://localhost:5000/users/update/:id
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const result = await userController.updateUser(id, data);
    return res
      .status(200)
      .json({ status: true, result, message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
});

// Xoá người dùng
// DELETE http://localhost:5000/users/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await userController.deleteUser(id);
    return res
      .status(200)
      .json({ status: true, result, message: "Xoá người dùng thành công" });
  } catch (error) {
    console.error("Lỗi xoá người dùng:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
});

// Lấy thông tin người dùng đã đăng nhập
// GET http://localhost:5000/users/profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await userController.getUserInfo(req.userId);
    return res.status(200).json({ status: true, result });
  } catch (error) {
    console.error("Lỗi lấy profile:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
});

// đăng xuất
// POST http://localhost:5000/users/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  return res
    .status(200)
    .json({ status: true, message: "Đăng xuất thành công" });
});

module.exports = router;
