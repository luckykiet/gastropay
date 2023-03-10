const axios = require('axios');
const MerchantModel = require("../models/MerchantModel");
const TransactionModel = require("../models/TransactionModel");
const { customAlphabet } = require('nanoid');
const RestaurantModel = require('../models/RestaurantModel');
const qs = require('qs');
const comgateConfig = require('../config/comgate');
const config = require('../config/config');
require('../dotenv_loader');
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
            const nanoid = customAlphabet(uppercaseNumberAlphabet, 8);
            let refId = nanoid();
            while (!isIDUnique && attempts < maxAttempts) {
                const existingDoc = await TransactionModel.findOne({ refId: refId });
                if (existingDoc) {
                    refId = nanoid();
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
                prepareOnly: true,
                email: body.email,
                expirationTime: "1h"
            }

            const useProxy = process.env.USE_PROXY;
            let response = '';
            let params = '';

            if (useProxy) {
                const options = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                const prepareData = {
                    "url": comgateConfig.CREATE_URL,
                    "data": JSON.stringify(dataToPaymentGate),
                    "headers": JSON.stringify({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    })
                }
                response = await axios.post(config.PROXY_URL, JSON.stringify(prepareData), options);
                params = new URLSearchParams(response.data.data);
            } else {
                const options = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                };
                response = await axios.post(comgateConfig.CREATE_URL, qs.stringify(dataToPaymentGate), options);
                params = new URLSearchParams(response.data);
            }

            const code = params.get('code');
            if (code !== '0') {
                const message = decodeURIComponent(params.get('message'));
                res.status(400).json({
                    success: false,
                    msg: message ? message : "Payment create failed!"
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
                            transId: transId,
                            status: "PENDING"
                        }
                    },
                    email: body.email,
                    deliveryMethod: body.deliveryMethod || ""
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

// BATCH PROCESSING
const BATCH_SIZE = 50;

const runAutoCheckPayment = async () => {
    let page = 1;
    let transactions = [];

    while (true) {
        const pendings = await TransactionModel.find({
            $or: [
                { 'paymentMethod.comgate.status': 'PENDING' },
                { 'paymentMethod.gopay.status': 'PENDING' }
            ]
        }).sort({ createAt: 'desc' }).select("refId").skip((page - 1) * BATCH_SIZE).limit(BATCH_SIZE).exec();

        if (pendings.length === 0) {
            break;
        }

        transactions = transactions.concat(pendings);
        page++;
    }

    console.log(`Checking ${transactions.length} pending transactions...`);

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (transaction) => {
            await checkPayment(transaction.refId);
        });

        await Promise.all(promises);
    }
};

const checkPayment = async (refId) => {
    const transaction = await TransactionModel.findOne({ refId: refId });
    if (!transaction) {
        return { success: false, msg: `Transaction not found` };
    }
    const restaurant = await RestaurantModel.findById(transaction.idRestaurant).select("idOwner").exec();
    if (!restaurant) {
        return { success: false, msg: `Restaurant not found` };
    }
    const merchant = await MerchantModel.findById(restaurant.idOwner).select("paymentGates").exec();

    if (!merchant) {
        return { success: false, msg: `Merchant not found` };
    }

    const paymentMethodName = Object.keys(transaction.paymentMethod)[0];

    if (paymentMethodName === 'comgate') {
        const comgate = merchant.paymentGates[paymentMethodName];
        const dataToPaymentGate = {
            merchant: comgate.merchant,
            secret: comgate.secret,
            transId: transaction.paymentMethod[paymentMethodName].transId,
        }

        const useProxy = process.env.USE_PROXY;
        let response = '';
        let params = '';

        if (useProxy) {
            const options = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            const prepareData = {
                "url": comgateConfig.STATUS_URL,
                "data": JSON.stringify(dataToPaymentGate),
                "headers": JSON.stringify({
                    'Content-Type': 'application/x-www-form-urlencoded'
                })
            }
            response = await axios.post(config.PROXY_URL, JSON.stringify(prepareData), options);
            params = new URLSearchParams(response.data.data);
        } else {
            const options = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            response = await axios.post(comgateConfig.STATUS_URL, qs.stringify(dataToPaymentGate), options);
            params = new URLSearchParams(response.data);
        }

        const code = params.get('code');
        if (code !== '0') {
            const message = decodeURIComponent(params.get('message'));
            return { success: false, msg: message ? message : "Failed to get a status!" };
        } else {
            const status = decodeURIComponent(params.get('status'));
            const statusField = "paymentMethod." + paymentMethodName + ".status";
            if (status === 'PAID') {
                await transaction.updateOne({ [statusField]: status });
                //TODO POST TO POS

            } else if (status === 'CANCELLED') {
                await transaction.updateOne({ [statusField]: status, status: status });
            }
            return { success: true, msg: status };
        }
    }
}

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
        await checkPayment(idTransaction);
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

const getPaymentMethods = async (req, res) => {
    const { idRestaurant } = req.params;

    const restaurant = await RestaurantModel.findById(idRestaurant).select("idOwner").exec();

    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }

    const merchant = await MerchantModel.findById(restaurant.idOwner).select("paymentGates").exec();

    if (!merchant) {
        return res
            .status(404)
            .json({ success: false, msg: `Merchant not found` });
    }

    const availableGates = [];

    const paymentGates = Object.keys(merchant.paymentGates);

    paymentGates.forEach(gate => {
        if (merchant.paymentGates[gate].isAvailable) {
            availableGates.push(gate);
        }
    });

    return res.status(200).json({ success: true, msg: availableGates });
}
module.exports = {
    createTransaction,
    getTransaction,
    getPaymentMethods,
    runAutoCheckPayment
}