const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Mixed } = Schema.Types;


const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'categories', required: true }, 
    price: { type: Schema.Types.Mixed,  required: true }, 
    quantity: { type: Number, required: true},
    image: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: Boolean, default: true },
    taste: { type: [String], default: [] },
    size: { type: [String], default: [] },
});
module.exports = mongoose.models.products || mongoose.model('products',productSchema);
