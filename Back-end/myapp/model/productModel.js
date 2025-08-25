const mongoose = require("mongoose");
const Schema = mongoose.Schema;
<<<<<<< HEAD
const MONGO_URI = "mongodb://localhost:27017/Fried_King";
const sizeSchema = new Schema(
  {
    name: { type: String, required: true },
    price: {
      original: { type: Number, required: true },
      discount: { type: Number },
=======


const sizeSchema = new Schema(
  {
    name: { type: String, required: true }, 
    price: {
      original: { type: Number, required: true },
      discount: { type: Number }, 
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
    },
  },
  { _id: false }
);

<<<<<<< HEAD
const productSchema = new Schema({
  name: { type: String, required: true },
  nameNoAccent: { type: String }, // <-- thêm
=======

const productSchema = new Schema({
  name: { type: String, required: true },
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  image: { type: String, required: true },
  description: { type: String, default: "" },
<<<<<<< HEAD
  descriptionNoAccent: { type: String }, // <-- thêm
  taste: { type: [String], default: [] },
  tasteNoAccent: { type: [String], default: [] }, // <-- thêm
=======
  taste: { type: [String], default: [] },
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
  status: { type: Boolean, default: true },
  quantity: { type: Number, required: true },
  view: { type: Number, default: 0 },
  time: { type: String, default: "30-45min" },
  saleOff: { type: Boolean, default: false },
  sizes: { type: [sizeSchema], required: true },
});

<<<<<<< HEAD
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
=======
module.exports =
  mongoose.models.products || mongoose.model("products", productSchema);

>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
