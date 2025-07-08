const express = require("express");
const router = express.Router();
const voucherController = require("../controller/voucherController.js");

router.get("/", voucherController.getAllVouchers);
router.get("/:code", voucherController.getVoucherByCode);
router.post("/", voucherController.createVoucher);
router.post("/apply", voucherController.applyVoucher); 
module.exports = router;
