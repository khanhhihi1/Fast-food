const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MONGO_URI = "mongodb://localhost:27017/Fried_King";
const sizeSchema = new Schema(
  {
    name: { type: String, required: true },
    price: {
      original: { type: Number, required: true },
      discount: { type: Number },
    },
  },
  { _id: false }
);

const productSchema = new Schema({
  name: { type: String, required: true },
  nameNoAccent: { type: String }, // <-- thêm
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  image: { type: String, default: "", required: true },
  description: { type: String, default: "" },
  descriptionNoAccent: { type: String }, // <-- thêm
  taste: { type: [String], default: [] },
  tasteNoAccent: { type: [String], default: [] }, // <-- thêm
  status: { type: Boolean, default: true },
  quantity: { type: Number, required: true },
  view: { type: Number, default: 0 },
  time: { type: String, default: "30-45min" },
  saleOff: { type: Boolean, default: false },
  sizes: { type: [sizeSchema], required: true },
});

// Trước khi lưu: Tự động tạo các trường NoAccent
productSchema.pre("save", function (next) {
  this.nameNoAccent = normalizeVietnamese(this.name);
  this.descriptionNoAccent = normalizeVietnamese(this.description);
  this.tasteNoAccent = this.taste.map(normalizeVietnamese);
  next();
});

function normalizeVietnamese(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}


module.exports =
  mongoose.models.products || mongoose.model("products", productSchema);
