const mongoose = require('mongoose');
const TransactionSchema = require("./schemas/transaction");

const TransactionModel = mongoose.model('Transaction', TransactionSchema);

module.exports = TransactionModel;
