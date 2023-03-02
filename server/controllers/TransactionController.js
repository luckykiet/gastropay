const axios = require('axios');
const MerchantModel = require("../models/MerchantModel");
const TransactionModel = require("../models/TransactionModel");
const { nanoid } = require('nanoid');
const RestaurantModel = require('../models/RestaurantModel');
const qs = require('qs');
const uppercaseNumberAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';


const createTransaction = async (req, res, next) => {
    const body = req.body;

    if (!body || !body.restaurant || !body.paymentGate || !body.orders) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a valid transaction",
        });
    }

    const restaurant = await RestaurantModel.findById(body.restaurant._id).select("idOwner").exec();

    if (!restaurant) {
        return res.status(404).json({
            success: false,
            msg: "Restaurant not found!",
        });
    }

    const owner = await MerchantModel.findById(restaurant.idOwner).select("paymentGates").exec();

    if (!owner) {
        return res.status(404).json({
            success: false,
            msg: "Merchant not found!",
        });
    }

    const paymentGate = body.paymentGate;

    if (paymentGate === 'comgate' && owner.paymentGates[paymentGate] && owner.paymentGates[paymentGate].isAvailable) {
        try {
            let isIDUnique = false;
            const maxAttempts = 3;
            let attempts = 0;
            let refId = nanoid(8, uppercaseNumberAlphabet);
            while (!isIDUnique && attempts < maxAttempts) {
                const existingDoc = await TransactionModel.findOne({ refId: refId });
                if (existingDoc) {
                    refId = nanoid(8, uppercaseNumberAlphabet);
                    attempts++;
                } else {
                    isIDUnique = true;
                }
            }

            if (!isIDUnique) {
                res.status(400).json({
                    success: false,
                    msg: `Failed to generate a unique ID after ${maxAttempts} attempts`
                });
            }

            const comgate = owner.paymentGates[paymentGate];
            const { merchant, curr, method, secret, label, test, country } = comgate;
            let totalPrice = 0;
            const orders = [];

            body.orders.forEach((item) => {
                const order = {
                    ean: item.ean,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    name: item.name
                };
                orders.push(order);
                totalPrice += order.quantity * order.price;
            });

            totalPrice += body.tips;

            // in haler
            if (curr === 'CZK') {
                totalPrice *= 100;
            }

            const dataToPaymentGate = {
                merchant: merchant,
                curr: curr,
                method: method,
                secret: secret,
                label: label,
                test: test,
                country: country,
                refId: refId,
                price: totalPrice,
                prepareOnly: true
            }

            const options = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };

            const response = await axios.post('https://payments.comgate.cz/v1.0/create', qs.stringify(dataToPaymentGate), options);

            const params = new URLSearchParams(response.data);
            const code = params.get('code');
            const message = decodeURIComponent(params.get('message'));

            if (code !== '0') {
                res.status(400).json({
                    success: false,
                    msg: message
                });
            } else {
                const transId = params.get('transId');
                const redirectUrl = decodeURIComponent(params.get('redirect'));
                console.log(redirectUrl);

                const data = {
                    refId: refId,
                    idRestaurant: body.restaurant._id,
                    cart:
                    {
                        orders: orders
                    },
                    tips: body.tips,
                    paymentMethod: {
                        comgate: {
                            transId: transId
                        }
                    }
                }

                const transaction = new TransactionModel(data);
                await transaction.save().then(() => {
                    return res.status(200).json({
                        success: true,
                        msg: transaction,
                    });
                });
            }
        } catch (error) {
            next(error);
        }
    } else {
        return res.status(400).json({
            success: false,
            msg: "Not supported payment gate, please choose another!",
        });
    }
};

const getTransaction = async (req, res) => {
    const { idTransaction } = req.params;

    const transaction = await TransactionModel.findOne({ refId: idTransaction });
    if (!transaction) {
        return res
            .status(404)
            .json({ success: false, msg: `Transaction not found` });
    }

    const restaurant = await RestaurantModel.findById(transaction.idRestaurant).select("name address").exec();

    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }

    return res.status(200).json({ success: true, msg: { transaction: transaction, restaurant: restaurant } });
}

module.exports = {
    createTransaction,
    getTransaction
}