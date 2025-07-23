const express = require("express");
const router = express.Router();
const voucherController = require("../controller/voucherController.js");

router.get("/", voucherController.getAllVouchers);
router.get("/:code", voucherController.getVoucherByCode);
router.post("/add", voucherController.createVoucher);
router.post("/apply", voucherController.applyVoucher); 
router.patch("/:id/restore", voucherController.restoreVoucher);
router.put("/update/:id", voucherController.updateVoucher);           // cập nhật
router.patch("/:id/hide", voucherController.hideVoucher);
module.exports = router;
