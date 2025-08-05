const express = require("express");
const router = express.Router();
const commentController = require("../controller/commentController.js");

// ⚠️ Route đặc biệt phải đặt trước route động
router.get("/commentable-products", commentController.getCommentableProducts);
router.get("/all", commentController.getAllComments);
// POST /comments - Gửi bình luận
router.post("/", commentController.createComment);

// GET /comments/:productId - Lấy bình luận theo sản phẩm
router.get("/:productId", commentController.getCommentsByProduct);

// PUT - Sửa bình luận
router.put("/:commentId", commentController.updateComment);

// DELETE - Xóa bình luận
router.delete("/:commentId", commentController.deleteComment);

module.exports = router;
