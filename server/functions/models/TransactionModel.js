const mongoose = require('mongoose');
const TransactionSchema = require("./schemas/TransactionSchema");

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

module.exports = TransactionModel;
