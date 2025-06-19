const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String },
});

module.exports =mongoose.models.Categories || mongoose.model("Categories", categoriesSchema);