const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController.js");

router.get("/", voucherController.getAllVouchers);
router.get("/:code", voucherController.getVoucherByCode);
router.post("/", voucherController.createVoucher);

module.exports = router;
