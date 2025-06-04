const mongoose = require('mongoose');
const { type } = require('os');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name:{type:String,require:true},
    category:{type:String,require:true},
    price:{ type:Number,require: false},
    quantity:{ type:Number,require: false},
    image:{type:String,require:true},
    status:{type:Boolean},
    taste:{type:Array,require:true},
    size:{type:Array,require:true}
})

module.exports = mongoose.models.products || mongoose.model('products',productSchema);
