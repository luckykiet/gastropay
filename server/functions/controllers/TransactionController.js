const axios = require('axios');
const moment = require('moment');
const { customAlphabet } = require('nanoid');
const sendMailWrapper = require('../mail_sender');
const qs = require('qs');
const MerchantModel = require("../models/MerchantModel");
const TransactionModel = require("../models/TransactionModel");
const RestaurantModel = require('../models/RestaurantModel');
const csobFunctions = require('./gates/csob');
const comgateConfig = require('../config/comgate');
const csobConfig = require('../config/csob');
const config = require('../config/config');
const paths = require('../config/paths');
const api = require('../config/api');
const mail = require('../config/mail');
const csob = require('../config/csob');
const uppercaseNumberAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const numberAlphabet = '0123456789';

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

            const dataToPaymentGate = {
                merchant: merchant,
                curr: curr,
                method: method,
                secret: secret,
                label: label,
                test: test,
                country: country,
                refId: refId,
                price: totalPrice * 100,
                prepareOnly: true,
                email: body.email,
                expirationTime: "1h"
            }

            const useProxy = process.env.USE_PROXY === 'true';

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
                await transaction.save().then(async () => {
                    const useSendMail = mail.USE_SEND_MAIL;
                    if (useSendMail) {
                        try {
                            const result = await sendMailWrapper(body.email,
                                "Účtenka k objednávce č: " + transaction.refId,
                                "Děkujeme za použití " + config.APP_NAME, "<a href='" + config.BASE_URL + "/" + api.TRANSACTION + "/" + transaction.refId + "' target='_blank' style='background-color: #ff3860;padding: 8px 12px;border-radius: 2px;font-size: 20px; color: #f5f5f5;text-decoration: none;font-weight:bold;display: inline-block;'>Odkaz k účtence</a>",
                                "Přejeme Vám dobrou chuť!"
                            );
                            console.log(result)
                        } catch (error) {
                            console.log(error);
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        msg: transaction,
                    });
                });
            }
        } catch (error) {
            next(error);
        }
    } else if (paymentGate === 'csob' && owner.paymentGates[paymentGate] && owner.paymentGates[paymentGate].isAvailable) {
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

            const csob = owner.paymentGates[paymentGate];
            const { merchantId, privateKey, passphrases, currency, language, test, payOperation, payMethod, closePayment } = csob;

            const orders = [];
            let totalPrice = 0;
            let totalQuantity = 0;
            body.orders.forEach((item) => {
                const order = {
                    ean: item.ean,
                    quantity: item.quantity,
                    price: parseFloat(item.price),
                    name: item.name
                };
                totalQuantity += order.quantity;
                totalPrice += order.price;
                orders.push(order);
            });
            totalPrice *= 100;

            const nanoidNumberOnly = customAlphabet(numberAlphabet, 8)
            const cart = [
                {
                    name: "Menu",
                    quantity: totalQuantity,
                    amount: totalPrice,
                    description: "Celkový košík"
                },
                {
                    name: "Tips",
                    quantity: 1,
                    amount: body.tips * 100,
                    description: "Tips pro " + config.APP_NAME
                }
            ];

            const dataToPaymentGate = {
                merchantId: merchantId,
                orderNo: nanoidNumberOnly(),
                dttm: moment().format('YYYYMMDDHHMMss'),
                payOperation: payOperation,
                payMethod: payMethod,
                totalAmount: totalPrice + (body.tips * 100),
                currency: currency,
                closePayment: closePayment,
                returnUrl: config.BASE_URL + paths.TRANSACTION + "/" + refId,
                returnMethod: "GET",
                cart: cart,
                language: language,
                ttlSec: csobConfig.TIME_EXPIRATION,
            }

            const payment = await csobFunctions.createPayment(privateKey, passphrases, dataToPaymentGate, test);

            if (!payment.success) {
                res.status(400).json({
                    success: false,
                    msg: payment.msg
                });
            } else {
                const payId = payment.msg.payId;

                const respGetUrl = await csobFunctions.getPaymentUrl(privateKey, passphrases, { merchantId: merchantId, payId: payId }, test);

                if (!respGetUrl.success) {
                    res.status(400).json({
                        success: false,
                        msg: respGetUrl.msg
                    });
                }

                const data = {
                    refId: refId,
                    idRestaurant: body.restaurant._id,
                    cart:
                    {
                        orders: orders
                    },
                    tips: body.tips,
                    paymentMethod: {
                        csob: {
                            payId: payId,
                            orderNo: dataToPaymentGate.orderNo,
                            dttm: dataToPaymentGate.dttm,
                            status: 2,
                            url: respGetUrl.msg
                        }
                    },
                    email: body.email,
                    deliveryMethod: body.deliveryMethod || ""
                }

                const transaction = new TransactionModel(data);
                await transaction.save().then(async () => {
                    const useSendMail = mail.USE_SEND_MAIL;
                    if (useSendMail) {
                        try {
                            const result = await sendMailWrapper(body.email,
                                "Účtenka k objednávce č: " + transaction.refId,
                                "Děkujeme za použití " + config.APP_NAME, "<a href='" + config.BASE_URL + "/" + api.TRANSACTION + "/" + transaction.refId + "' target='_blank' style='background-color: #ff3860;padding: 8px 12px;border-radius: 2px;font-size: 20px; color: #f5f5f5;text-decoration: none;font-weight:bold;display: inline-block;'>Odkaz k účtence</a>",
                                "Přejeme Vám dobrou chuť!"
                            );
                            console.log(result)
                        } catch (error) {
                            console.log(error);
                        }
                    }

                    return res.status(200).json({
                        success: true,
                        msg: transaction,
                    });
                });
            }
        } catch (error) {
            next(error);
        }
    }
    else {
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
                { 'paymentMethod.csob.status': 1 },
                { 'paymentMethod.csob.status': 2 }
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

        const useProxy = process.env.USE_PROXY === 'true';
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
    } else if (paymentMethodName === 'csob') {
        const { privateKey, passphrases, merchantId, test } = merchant.paymentGates[paymentMethodName];
        const { payId } = transaction.paymentMethod[paymentMethodName];
        const checkStatusResp = await csobFunctions.getPaymentStatus(privateKey, passphrases, { merchantId: merchantId, payId: payId }, test)
        const status = checkStatusResp.msg.paymentStatus;
        const statusField = "paymentMethod." + paymentMethodName + ".status";
        //     1: "Platba založena"
        //     2: "Platba probíhá"
        //     3: "Platba zrušena"
        //     4: "Platba potvrzena"
        //     5: "Platba odvolána"
        //     6: "Platba zamítnuta"
        //     7: "Čekání na zúčtování"
        //     8: "Platba zúčtována"
        //     9: "Zpracování vrácení"
        //     10: "Platba vrácena"
        if (status === 4 || status === 7 || status === 8) {
            await transaction.updateOne({ [statusField]: status });
            //TODO POST TO POS

        } else if (status === 3 || status === 5 || status === 6) {
            await transaction.updateOne({ [statusField]: status, status: "CANCELLED" });
        }
        return { success: true, msg: status };
    }
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
    getPaymentMethods,
    runAutoCheckPayment,
    checkPayment
}