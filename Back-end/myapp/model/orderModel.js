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
    items: [orderItemSchema],
    total: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
     paymentMethod: {
      type: String,
      enum: ["momo", "cod"],
      default: "cod",
    },
    status: {
      type: String,
      enum: ["Chờ xác nhận", "Đã xác nhận", "Đang vận chuyển", "Hoàn tất", "Hủy đơn hàng"],
      default: "Chờ xác nhận",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Orders || mongoose.model("Orders", orderSchema);
