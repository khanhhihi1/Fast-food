const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountValue: { type: Number, required: true }, // số tiền hoặc %
  discountType: { type: String, enum: ["fixed", "percentage"], required: true },
  minOrderValue: { type: Number, default: 0 }, // đơn hàng tối thiểu để áp dụng
  maxDiscount: { type: Number }, // giới hạn nếu là phần trăm
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Voucher", voucherSchema);