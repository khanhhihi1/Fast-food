const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: false, unique: true }, // Cho phép null nếu login Google
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // 👈 không bắt buộc
    favorites: [{ type: Schema.Types.ObjectId, ref: "products" }],
    googleId: { type: String, unique: true, default: null },
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
