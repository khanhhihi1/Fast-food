const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { Mixed } = Schema.Types;


const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'categories', required: true },
    price: {
        type: Schema.Types.Mixed, required: true, validate: {
            validator: function (price) {
                if (typeof price === 'number') {
                    return price > 0;
                }
                if (typeof price === 'object' && price !== null) {
                    const validSizes = ['Nhỏ', 'Vừa', 'Lớn'];
                    return (
                        Object.keys(price).length > 0 &&
                        Object.keys(price).every(key => validSizes.includes(key)) &&
                        Object.values(price).every(value => typeof value === 'number' && value > 0)
                    );
                }
                return false;
            },
            message: 'Price phải là số dương hoặc object với các kích thước hợp lệ (Nhỏ, Vừa, Lớn)',
        }
    },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: Boolean, default: true },
    taste: { type: [String], default: [] },
    size: { type: [String], default: [] },
    view: { type: Number, default: 0, },
});
module.exports = mongoose.models.products || mongoose.model('products', productSchema);
