const mongoose = require('mongoose');
const MerchantSchema = require("./schemas/merchant");

const MerchantModel = mongoose.model('Merchant', MerchantSchema);

module.exports = MerchantModel;
