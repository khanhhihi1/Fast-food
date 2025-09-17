// File: models/productModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
  nameNoAccent: { type: String },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
    required: true,
  },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionNoAccent: { type: String },
  taste: { type: [String], default: [] },
  tasteNoAccent: { type: [String], default: [] },
  status: { type: Boolean, default: true },
  quantity: { type: Number, required: true },
  view: { type: Number, default: 0 },
  time: { type: String, default: '30-45min' },
  saleOff: { type: Boolean, default: false },
  sizes: { type: [sizeSchema], required: true },
  isDaily: { type: Boolean, default: false }, // true: sản phẩm theo ngày, false: tồn kho
  dailyInitialQuantity: { type: Number, default: 0 }, // Giá trị ban đầu reset hàng ngày (chỉ áp dụng nếu isDaily=true)
  lastResetDate: { type: Date }, // Theo dõi ngày reset cuối cùng để kiểm tra
  leftoverHistory: [{ // Lịch sử dư thừa (cho stats), optional
    date: { type: Date },
    leftoverQuantity: { type: Number }
  }]
});

// Pre-save hook to normalize Vietnamese text for search optimization
productSchema.pre('save', function (next) {
  this.nameNoAccent = normalizeVietnamese(this.name);
  this.descriptionNoAccent = normalizeVietnamese(this.description);
  this.tasteNoAccent = this.taste.map(normalizeVietnamese);
  next();
});

// Utility function for normalization
function normalizeVietnamese(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

module.exports = mongoose.models.products || mongoose.model('products', productSchema);