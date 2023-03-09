const mongoose = require('mongoose');
const MerchantSchema = require("./schemas/MerchantSchema");

const MerchantModel = mongoose.model('Merchant', MerchantSchema);

module.exports = MerchantModel;
