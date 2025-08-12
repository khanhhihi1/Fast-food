const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
    isHidden: { type: Boolean, default: false } // thêm field này
});

module.exports =
  mongoose.models.Categories || mongoose.model("categories", categoriesSchema);
