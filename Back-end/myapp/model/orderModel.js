const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "products",
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String },
  sizeName: { type: String, required: true },
  taste: { type: [String], default: [] },
  quantity: { type: Number, required: true, min: 1 },
  price: {
    original: { type: Number, required: true },
    discount: { type: Number },
  },
  finalPrice: { type: Number, required: true },
});
const orderSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema]},
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },

    // --- Voucher ---
    voucherCode: { type: String },
    voucherData: {
      type: new Schema(
        {
          code: String,
          description: String,
          discountType: { type: String, enum: ["fixed", "percentage"] },
          discountValue: Number,
          minOrderValue: Number,
          maxDiscount: Number,
          voucherType: { type: String, enum: ["timed", "limited"] },
          startsAt: Date,
          expiresAt: Date,
          usageLimit: Number,
          currentUsage: Number,
        },
        { _id: false }
      ),
      default: null,
    },
    shippingInfo: {
      name: String,
      phone: String,
      address: String,
    },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
    paymentMethod: {
      type: String,
      enum: ["momo", "cod", "vnpay", "stripe"],
      default: "cod",
    },

    // --- Status ---
    status: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5],
      default: 0,
    },

    // --- Payment IDs ---
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
    momoTransId: { type: String },
  },
  { timestamps: true }
);

const OrderStatus = {
  PENDING: 0,
  WAITING_PAYMENT: 1,
  CONFIRMED: 2,
  SHIPPING: 3,
  COMPLETED: 4,
  CANCELLED: 5,
};

const OrderStatusText = {
  0: "Chờ xác nhận",
  1: "Chờ thanh toán",
  2: "Đã xác nhận",
  3: "Đang vận chuyển",
  4: "Hoàn tất",
  5: "Hủy đơn hàng",
};

const Order =
  mongoose.models.Orders || mongoose.model("Orders", orderSchema);

module.exports = {
  Order,
  OrderStatus,
  OrderStatusText,
};
