const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");

// Đăng ký người dùng
// POST http://localhost:3000/user/register
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
// POST http://localhost:3000/user/login
router.post("/login", async (req, res) => {
  try {
    const data = req.body;
    const result = await userController.loginUser(data);
    return res
      .status(200)
      .json({ status: true, result, message: "Đăng nhập thành công" });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.message);
    return res.status(401).json({ status: false, message: error.message });
  }
});

// Cập nhật thông tin người dùng
// PUT http://localhost:3000/user/update/:id
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
// DELETE http://localhost:3000/user/delete/:id
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

module.exports = router;
