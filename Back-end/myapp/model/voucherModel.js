const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountValue: { type: Number, required: true }, // số tiền hoặc %
  discountType: { type: String, enum: ["fixed", "percentage"], required: true },
  minOrderValue: { type: Number, default: 0 }, // đơn hàng tối thiểu để áp dụng
  maxDiscount: { type: Number, default: 0 }, // giới hạn nếu là phần trăm
  voucherType: { type: String, enum: ["timed", "limited"], required: true }, // Loại mới: timed hoặc limited
  startsAt: { type: Date, default: Date.now }, // Ngày bắt đầu (mới)
  expiresAt: { type: Date }, // Chỉ required nếu voucherType = "timed"
  usageLimit: { type: Number }, // Chỉ required nếu voucherType = "limited"
  currentUsage: { type: Number, default: 0 }, // Số lượng đã sử dụng
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Validate tùy theo voucherType
voucherSchema.pre('validate', function(next) {
  if (this.voucherType === 'timed') {
    if (!this.expiresAt) {
      next(new Error('expiresAt là bắt buộc cho voucher timed'));
    }
    if (this.expiresAt <= this.startsAt) {
      next(new Error('expiresAt phải lớn hơn startsAt'));
    }
  } else if (this.voucherType === 'limited') {
    if (!this.usageLimit || this.usageLimit <= 0) {
      next(new Error('usageLimit là bắt buộc và phải > 0 cho voucher limited'));
    }
  }
  next();
});

module.exports = mongoose.model("Voucher", voucherSchema);