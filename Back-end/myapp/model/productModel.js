const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sizeSchema = new Schema(
  {
    name: { type: String, required: true }, // Ví dụ: "S", "M", "L", hoặc "default"
    price: {
      original: { type: Number, required: true },
      discount: { type: Number }, // Không bắt buộc, chỉ có nếu giảm giá
    },
  },
  { _id: false }
);

const productSchema = new Schema({
  name: { type: String, required: true },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  image: { type: String, required: true },
  description: { type: String, default: "" },
  taste: { type: [String], default: [] },
  status: { type: Boolean, default: true },
  quantity: { type: Number, required: true },
  view: { type: Number, default: 0 },
  time: { type: String, default: "30-45min" },
  saleOff: { type: Boolean, default: false },
  sizes: { type: [sizeSchema], required: true },
});

module.exports =
  mongoose.models.products || mongoose.model("products", productSchema);
