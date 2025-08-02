const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tempOrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        name: String,
        imageUrl: String,
        sizeName: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        taste: [String],
      },
    ],
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    voucherCode: { type: String },
    voucherData: {
      type: new Schema(
        {
          code: String,
          description: String,
          discountType: String,
          discountValue: Number,
          minOrderValue: Number,
          maxDiscount: Number,
          expiresAt: String,
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
    paymentMethod: {
      type: String,
      enum: ["cod", "momo", "vnpay", "stripe"],
      default: "cod",
    },
    expiresAt: { type: Date, default: () => Date.now() + 15 * 60 * 1000 }, // Hết hạn sau 15 phút
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.TempOrder || mongoose.model("TempOrder", tempOrderSchema);
