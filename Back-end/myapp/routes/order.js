const express = require("express");
const router = express.Router();

const orderController = require("../controller/orderController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const isAdmin = require("../middleware/isAdmin.js");

// Người dùng tạo đơn hàng từ giỏ hàng
router.post("/", authMiddleware, async (req, res) => {
  try {
    const result = await orderController.createOrderFromCart(req, res);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Người dùng lấy đơn hàng của mình
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await orderController.getUserOrders(req, res);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Admin lấy tất cả đơn hàng
router.get("/admin/all", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await orderController.getAllOrders(req, res);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Admin cập nhật trạng thái đơn hàng
router.put("/admin/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await orderController.updateOrderStatus(req, res);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
