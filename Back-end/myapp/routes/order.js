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

// Admin lấy chi tiết đơn hàng theo ID (mới thêm cho modal frontend)
router.get("/admin/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await orderController.getOrderById(req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Admin cập nhật trạng thái đơn hàng
router.put("/admin/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    const result = await orderController.updateOrderStatus(req, res);
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Người dùng tạo đơn hàng từ đơn tạm thời (TempOrder)
router.post("/from-temp", authMiddleware, async (req, res) => {
  try {
    const result = await orderController.createOrderFromTempOrder(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Người dùng hủy đơn hàng
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const result = await orderController.cancelOrder(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Lấy trạng thái đơn hàng
router.get("/:id/status", authMiddleware, async (req, res) => {
  try {
    const result = await orderController.getOrderStatus(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;