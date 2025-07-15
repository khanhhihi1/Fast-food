const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createTempOrder,
  getTempOrderByUser,
  deleteTempOrder,
  updateShippingInfo,
} = require("../controller/tempOrderController");

const router = express.Router();

router.post("/", authMiddleware, createTempOrder); // Lưu đơn tạm
router.get("/", authMiddleware, getTempOrderByUser); // Lấy đơn tạm
router.delete("/", authMiddleware, deleteTempOrder); // Xoá đơn tạm
router.put("/update-shipping", authMiddleware, updateShippingInfo);

module.exports = router;
