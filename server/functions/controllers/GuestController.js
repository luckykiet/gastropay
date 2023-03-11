const TransactionModel = require("../models/TransactionModel");
const RestaurantModel = require('../models/RestaurantModel');
const MerchantModel = require("../models/MerchantModel");
const TransactionController = require('./TransactionController');

const getTransaction = async (req, res) => {
    const { idTransaction } = req.params;

    const transaction = await TransactionModel.findOne({ refId: idTransaction });
    if (!transaction) {
        return res
            .status(404)
            .json({ success: false, msg: `Transaction not found` });
    }

    const paymentMethodName = Object.keys(transaction.paymentMethod)[0];

    if (transaction.paymentMethod[paymentMethodName].status === 'PENDING') {
        await TransactionController.checkPayment(idTransaction);
    }

    const restaurant = await RestaurantModel.findById(transaction.idRestaurant).select("idOwner name address").exec();

    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }

    const merchant = await MerchantModel.findById(restaurant.idOwner).select("ico").exec();

    if (!merchant) {
        return res
            .status(404)
            .json({ success: false, msg: `Merchant not found` });
    }

    return res.status(200).json({ success: true, msg: { transaction: transaction, restaurant: restaurant, merchant: merchant } });
}

module.exports = { getTransaction }