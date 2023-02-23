const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComgateSchema = new Schema({
    merchantId: { type: String, trim: true },
    test: { type: String, default: true, required: true },
    country: { type: String, required: true, default: 'CZ', enum: ['ALL', 'AT', 'BE', 'CY', 'CZ', 'DE', 'EE', 'EL', 'ES', 'FI', 'FR', 'GB', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SL', 'SK', 'SV', 'US'] },
    methods: { type: String, default: 'ALL', required: true },
    secret: { type: String, trim: true },
    currency: { type: String, required: true, default: 'CZK', enum: ['CZK', 'EUR', 'PLN', 'HUF', 'USD', 'GBP', 'RON', 'NOK', 'SEK'] },
    isAvailable: { type: Boolean, required: true, default: false }
});

module.exports = {
    ComgateSchema
};