const TransactionModel = require("../models/TransactionModel");
const RestaurantModel = require('../models/RestaurantModel');
const MerchantModel = require("../models/MerchantModel");
const TransactionController = require('./TransactionController');

const getTransaction = async (req, res) => {
    try {
        const { idTransaction } = req.params;

        let transaction = await TransactionModel.findOne({ refId: idTransaction });
        if (!transaction) {
            return res
                .status(404)
                .json({ success: false, msg: `Transaction not found` });
        }

        const paymentMethodName = Object.keys(transaction.paymentMethod)[0];
        const status = transaction.paymentMethod[paymentMethodName].status;

        if (status === 'PENDING' || status === 1 || status === 2) {
            await TransactionController.checkPayment(idTransaction);
            transaction = await TransactionModel.findOne({ refId: idTransaction });
        } else if (transaction.status === 'PAID') {
            await TransactionController.sendToPos(transaction.refId);
            transaction = await TransactionModel.findOne({ refId: idTransaction });
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
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
}

module.exports = { getTransaction }