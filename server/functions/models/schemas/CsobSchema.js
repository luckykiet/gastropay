const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const csobConfig = require('../../config/csob');

const CsobSchema = new Schema({
    merchantId: { type: String, trim: true, default: "merchant" },
    privateKey: { type: String, required: true, default: "privateKey" },
    passphrases: { type: String, default: "" },
    publicKey: { type: String, required: true, default: "publicKey" },
    currency: { type: String, required: true, default: 'CZK', enum: csobConfig.CURRENCIES },
    language: { type: String, required: true, trim: true, default: "cs", enum: csobConfig.LANGUAGES },
    payOperation: { type: String, default: 'payment', enum: csobConfig.PAY_OPERATIONS },
    payMethod: { type: String, default: 'card', enum: csobConfig.PAYMENT_METHODS },
    closePayment: { type: Boolean, default: true, required: true },
    test: { type: Boolean, default: true, required: true },
    isAvailable: { type: Boolean, required: true, default: false }
}, { strict: true, _id: false });

module.exports = CsobSchema;