const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController");

// Tạo thanh toán MoMo
router.post("/momo", paymentController.createMomoPayment);

// Nhận callback MoMo
router.post("/momo/ipn", paymentController.momoIpn);

// Hoàn tiền MoMo
router.post("/momo/refund", paymentController.refundMomo);

module.exports = router;
