const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
<<<<<<< HEAD
    isHidden: { type: Boolean, default: false } // thêm field này
=======
>>>>>>> e2df97ba9c0533a07c22052c53f90a2eba1607fb
});

module.exports =
  mongoose.models.Categories || mongoose.model("categories", categoriesSchema);
