const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

module.exports =
  mongoose.models.Category || mongoose.model("Category", categoriesSchema);
