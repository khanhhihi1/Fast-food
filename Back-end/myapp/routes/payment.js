const express = require("express");
const router = express.Router();
const paymentController = require("../controller/paymentController.js");
const bodyParser = require("body-parser");

// Tạo thanh toán MoMo
router.post("/momo", paymentController.createMomoPayment);

// Nhận callback MoMo
router.post("/momo/ipn", paymentController.momoIpn);

// Hoàn tiền MoMo
router.post("/momo/refund", paymentController.refundMomo);

// Tạo thanh toán Stripe
router.post("/stripe", paymentController.createStripePayment);

// nhận callback Stripe
router.post(
  "/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

router.get("/stripe/session/:sessionId", paymentController.getStripeSession);

router.post("/stripe/refund", paymentController.refundStripe);

module.exports = router;
