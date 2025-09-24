const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: false, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    phone: { type: String, required: true }, // 👈 thêm số điện thoại
    addresses: [{ // 👈 Thay đổi thành mảng
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      isDefault: { type: Boolean, default: false }
    }],
    favorites: [{ type: Schema.Types.ObjectId, ref: "products" }],
    googleId: { type: String, unique: true, sparse: true },
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "banned", "deleted"],
      default: "active",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);