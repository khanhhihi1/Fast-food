const mongoose = require("mongoose");
<<<<<<< HEAD
const Schema = mongoose.Schema;
=======

>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
<<<<<<< HEAD
    favorites: [{ type: Schema.Types.ObjectId, ref: "products" }],
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb

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
  {
    timestamps: true, // thêm createdAt và updatedAt
  }
<<<<<<< HEAD
 
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
);

module.exports = mongoose.model("User", userSchema);
