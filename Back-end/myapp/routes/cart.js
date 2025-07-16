const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();
const {
  addToCart,
  getAllCart,
  removeFromCart,
  updateCartItem,
  syncCart,
  clearCart,
} = require("../controller/cartController.js");

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const result = await addToCart(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Lấy tất cả mục trong giỏ hàng
router.get("/", authMiddleware, async (req, res) => {
  try {
    const result = await getAllCart(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Xóa một mục khỏi giỏ hàng
router.delete("/remove/:id", authMiddleware, async (req, res) => {
  try {
    const result = await removeFromCart(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Cập nhật một mục trong giỏ hàng
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const result = await updateCartItem(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
});

// Đồng bộ giỏ hàng với sản phẩm
router.post("/sync", authMiddleware, async (req, res) => {
  try {
    const result = await syncCart(req);
    res.json({ status: true, result });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
});

// Xóa toàn bộ giỏ hàng cho user hiện tại
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const result = await clearCart(req);
    res.json({ status: true, result });
  } catch (error) {
    console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
    res.status(500).json({ status: false, message: error.message });
  }
});

module.exports = router;
