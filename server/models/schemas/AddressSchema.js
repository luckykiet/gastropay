const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    street: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    postalCode: { type: String, required: true, match: [/^\d{3} ?\d{2}$/, "Postal code must be: 11000 or 110 00"] }
}, { strict: true, _id: false });

module.exports = AddressSchema;