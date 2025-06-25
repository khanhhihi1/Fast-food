const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema cho từng size
const sizeSchema = new Schema(
  {
    name: { type: String, required: true }, // Ví dụ: "Nhỏ", "Vừa", "Lớn"
    price: {
      original: { type: Number, required: true },
      discount: { type: Number }, // Optional
    },
  },
  { _id: false }
);

// Schema chính cho sản phẩm
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
