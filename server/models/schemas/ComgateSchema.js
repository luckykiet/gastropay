const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../../../src/config/config')

const ComgateSchema = new Schema({
    merchant: { type: String, trim: true, default: "merchant" },
    test: { type: Boolean, default: true, required: true },
    country: { type: String, required: true, default: 'CZ', enum: config.COMGATE.COUNTRIES },
    label: { type: String, trim: true, default: "Gastro Pay", match: [/^[a-zA-Z0-9 ]{1,16}$/, "1-16 characters only words or numbers"] },
    method: { type: String, default: 'ALL', required: true, enum: config.COMGATE.METHODS },
    secret: { type: String, trim: true, default: "secret" },
    curr: { type: String, required: true, default: 'CZK', enum: config.COMGATE.CURRENCIES },
    isAvailable: { type: Boolean, required: true, default: false }
}, { strict: true, _id: false });

module.exports = ComgateSchema;