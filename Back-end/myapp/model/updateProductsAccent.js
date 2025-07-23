const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MONGO_URI = "mongodb://localhost:27017/Fried_King";

// Schema size con
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

// Hàm bỏ dấu tiếng Việt
function normalizeVietnamese(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Schema sản phẩm chính
const productSchema = new Schema({
  name: { type: String, required: true },
  nameNoAccent: { type: String },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "categories",
    required: true,
  },
  image: { type: String, required: true },
  description: { type: String, default: "" },
  descriptionNoAccent: { type: String },
  taste: { type: [String], default: [] },
  tasteNoAccent: { type: [String], default: [] },
  status: { type: Boolean, default: true },
  quantity: { type: Number, required: true },
  view: { type: Number, default: 0 },
  time: { type: String, default: "30-45min" },
  saleOff: { type: Boolean, default: false },
  sizes: { type: [sizeSchema], required: true },
});

// Middleware: tự động tạo các trường NoAccent trước khi lưu
productSchema.pre("save", function (next) {
  this.nameNoAccent = normalizeVietnamese(this.name || "");
  this.descriptionNoAccent = normalizeVietnamese(this.description || "");
  this.tasteNoAccent = (this.taste || []).map(normalizeVietnamese);
  next();
});

// ⚠️ Quan trọng: Khai báo model để dùng trong hàm bên dưới
const Product = mongoose.models.products || mongoose.model("products", productSchema);

// Hàm cập nhật toàn bộ sản phẩm
async function updateAllProducts() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Đã kết nối MongoDB");

    const products = await Product.find();
    console.log(`🔍 Tổng sản phẩm cần cập nhật: ${products.length}`);

    for (const product of products) {
      product.nameNoAccent = normalizeVietnamese(product.name || "");
      product.descriptionNoAccent = normalizeVietnamese(product.description || "");
      product.tasteNoAccent = (product.taste || []).map(normalizeVietnamese);

      await product.save();
    }

    console.log("✅ Đã cập nhật tất cả sản phẩm thành công!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", err);
  }
}

// Chạy hàm cập nhật
updateAllProducts();

module.exports = Product;
