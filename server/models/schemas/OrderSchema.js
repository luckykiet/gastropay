const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    ean: { type: String, trim: true, required: true },
    name: { type: String, trim: true, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
}, { strict: true, _id: false });

OrderSchema.path('price').validate(function (value) {
    return value >= 0;
}, 'Price must be a positive number.');

OrderSchema.path('quantity').validate(function (value) {
    return value >= 0;
}, 'Quantity must be a positive number.');

module.exports = OrderSchema;