const RestaurantModel = require("../models/RestaurantModel");
const TransactionModel = require("../models/TransactionModel");
const moment = require('moment');

const checkTransactionStatus = async (req, res) => {
    try {
        const { key, paymentId, paymentGate } = req.body;
        const restaurant = await RestaurantModel.findOne({ key: key });
        if (!restaurant) {
            return res.status(400).json({
                success: false,
                msg: "Invalid key",
            });
        }

        if (paymentGate === 'comgate') {
            const transaction = await TransactionModel.findOne({ ['paymentMethod.' + paymentGate + '.transId']: paymentId });
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    msg: "Transaction not found",
                });
            }
            return res.status(200).json({
                success: true,
                msg: {
                    refId: transaction.refId,
                    status: transaction.status,
                    items: transaction.cart.orders,
                    tips: transaction.tips,
                    deliveryMethod: transaction.deliveryMethod,
                    paymentStatus: transaction.paymentMethod[paymentGate].status,
                    createdAt: moment.utc(transaction.createdAt).format("DD/MM/YYYY HH:mm")
                },
            });
        } else if (paymentGate === 'csob') {
            const transaction = await TransactionModel.findOne({ ['paymentMethod.' + paymentGate + '.payId']: paymentId });
            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    msg: "Transaction not found",
                });
            }
            return res.status(200).json({
                success: true,
                msg: {
                    refId: transaction.refId,
                    status: transaction.status,
                    items: transaction.cart.orders,
                    tips: transaction.tips,
                    deliveryMethod: transaction.deliveryMethod,
                    paymentStatus: transaction.paymentMethod[paymentGate].status,
                    createdAt: moment.utc(transaction.createdAt).format("DD/MM/YYYY HH:mm")
                },
            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "Invalid payment gate",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "Internal error, please try again later.",
        });
    }
}

module.exports = {
    checkTransactionStatus
}