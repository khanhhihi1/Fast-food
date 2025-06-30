const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const router = express.Router();
const { addToCart, getAllCart, removeFromCart, updateCartItem, syncCart } = require("../controller/cartController.js");

// Thêm sản phẩm vào giỏ hàng
router.post("/add", authMiddleware, addToCart);

// Lấy tất cả mục trong giỏ hàng
router.get("/", authMiddleware, getAllCart);

// Xóa một mục khỏi giỏ hàng
router.delete("/remove/:id", authMiddleware, removeFromCart);

// Cập nhật một mục trong giỏ hàng
router.put("/update/:id", authMiddleware, updateCartItem);

// Đồng bộ giỏ hàng với sản phẩm
router.post("/sync", authMiddleware, syncCart);

module.exports = router;