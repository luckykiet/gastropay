const moment = require('moment');
const { customAlphabet } = require('nanoid');
const axios = require('axios');
const sendMailWrapper = require('../mail_sender');
const MerchantModel = require("../models/MerchantModel");
const TransactionModel = require("../models/TransactionModel");
const RestaurantModel = require('../models/RestaurantModel');
const csobFunctions = require('./gates/csob');
const comgateFunctions = require('./gates/comgate');
const csobConfig = require('../config/csob');
const config = require('../config/config');
const paths = require('../config/paths');
const api = require('../config/api');
const mail = require('../config/mail');
const uppercaseNumberAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const numberAlphabet = '0123456789';

const createTransaction = async (req, res, next) => {
    const body = req.body;
    try {
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

        if (paymentGate !== 'comgate' && paymentGate !== 'csob') {
            return res.status(400).json({
                success: false,
                msg: "Not supported payment gate, please choose another!",
            });
        }
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

        const orders = [];
        let totalPrice = 0;
        let totalQuantity = 0;
        for (const item of body.orders) {
            const order = {
                ean: item.ean,
                quantity: item.quantity,
                price: parseFloat(item.price),
                name: item.name
            };
            orders.push(order);
            totalQuantity += order.quantity;
            totalPrice += order.price * item.quantity;
        }
        totalPrice *= 100;
        let data = {};

        if (paymentGate === 'comgate' && owner.paymentGates[paymentGate] && owner.paymentGates[paymentGate].isAvailable) {
            const comgate = owner.paymentGates[paymentGate];
            const { merchant, curr, method, secret, label, test, country } = comgate;

            const dataToPaymentGate = {
                merchant: merchant,
                curr: curr,
                method: method,
                secret: secret,
                label: label,
                test: test,
                country: country,
                refId: refId,
                price: totalPrice + (body.tips * 100),
                prepareOnly: true,
                email: body.email,
                expirationTime: "1h"
            }

            const payment = await comgateFunctions.createPayment(dataToPaymentGate);

            if (!payment.success) {
                res.status(400).json({
                    success: false,
                    msg: payment.msg
                });
            }

            const params = payment.msg;

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
                data = {
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
                    deliveryMethod: body.deliveryMethod
                }
            }
        } else if (paymentGate === 'csob' && owner.paymentGates[paymentGate] && owner.paymentGates[paymentGate].isAvailable) {
            const csob = owner.paymentGates[paymentGate];
            const { merchantId, privateKey, passphrases, currency, language, test, payOperation, payMethod, closePayment } = csob;

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

                data = {
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
                    deliveryMethod: body.deliveryMethod
                }
            }
        } else {
            return res.status(400).json({
                success: false,
                msg: "Payment gate is not available, please choose another!",
            });
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
    } catch (error) {
        next(error);
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

    console.log(`Checking ${transactions.length} pending transactions to be paid...`);

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (transaction) => {
            await checkPayment(transaction.refId);
        });

        await Promise.all(promises);
    }
};

const checkPayment = async (refId) => {
    try {
        const transaction = await TransactionModel.findOne({ refId: refId });
        if (!transaction) {
            return { success: false, msg: `Transaction not found` };
        }
        const restaurant = await RestaurantModel.findById(transaction.idRestaurant).select("idOwner api").exec();
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

            const checkStatusResp = await comgateFunctions.getPaymentStatus(dataToPaymentGate);

            if (!checkStatusResp.success) {
                return {
                    success: false,
                    msg: checkStatusResp.msg
                };
            }
            const params = checkStatusResp.msg;
            const code = params.get('code');
            if (code !== '0') {
                const message = decodeURIComponent(params.get('message'));
                return { success: false, msg: message ? message : "Failed to get a status!" };
            } else {
                const newStatus = decodeURIComponent(params.get('status'));
                const statusField = "paymentMethod." + paymentMethodName + ".status";
                if (transaction.paymentMethod[paymentMethodName].status !== newStatus) {
                    if (newStatus === 'PAID') {
                        const newTransaction = await TransactionModel.findOneAndUpdate(transaction._id, { [statusField]: newStatus, status: newStatus }, { new: true })
                        await sendToPos(newTransaction.refId);
                    } else if (newStatus === 'CANCELLED') {
                        await TransactionModel.findOneAndUpdate(transaction._id, { [statusField]: newStatus, status: newStatus }, { new: true })
                    }
                }
                return { success: true, msg: newStatus };
            }
        } else if (paymentMethodName === 'csob') {
            const { privateKey, passphrases, merchantId, test } = merchant.paymentGates[paymentMethodName];
            const { payId, status } = transaction.paymentMethod[paymentMethodName];
            const checkStatusResp = await csobFunctions.getPaymentStatus(privateKey, passphrases, { merchantId: merchantId, payId: payId }, test)
            const statusField = "paymentMethod." + paymentMethodName + ".status";
            const newStatus = checkStatusResp.msg.paymentStatus;
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
            if (newStatus !== status) {
                if (newStatus === 4 || newStatus === 7 || newStatus === 8) {
                    const newTransaction = await TransactionModel.findOneAndUpdate(transaction._id, { [statusField]: newStatus, status: 'PAID' }, { new: true })
                    await sendToPos(newTransaction.refId);
                } else if (newStatus === 3 || newStatus === 5 || newStatus === 6) {
                    await TransactionModel.findOneAndUpdate(transaction._id, { [statusField]: newStatus, status: 'CANCELLED' }, { new: true })
                }
            }
            return { success: true, msg: newStatus };
        }
    } catch (error) {
        console.log(error);
        return { success: false, msg: error };
    }
}

const getPaymentMethods = async (req, res) => {
    try {
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
                availableGates.push({ paymentGate: gate, test: merchant.paymentGates[gate].test });
            }
        });
        return res.status(200).json({ success: true, msg: availableGates });
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
}

const runAutoSendToPos = async () => {
    let page = 1;
    let transactions = [];

    while (true) {
        const pendings = await TransactionModel.find({
            $and: [
                { 'pos.isConfirmed': false },
                { 'status': 'PAID' },
            ]
        }).sort({ createAt: 'desc' }).select("refId").skip((page - 1) * BATCH_SIZE).limit(BATCH_SIZE).exec();

        if (pendings.length === 0) {
            break;
        }

        transactions = transactions.concat(pendings);
        page++;
    }

    console.log(`Checking ${transactions.length} pending transactions to send to POS...`);

    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);

        const promises = batch.map(async (transaction) => {
            await sendToPos(transaction.refId);
        });

        await Promise.all(promises);
    }
};

const sendToPos = async (refId) => {
    console.log("Sending " + refId + " to POS")
    const transaction = await TransactionModel.findOne({ refId: refId });
    if (!transaction) {
        return { success: false, msg: `Transaction not found` };
    }

    if (transaction.status === 'COMPLETED' || transaction.status === 'CANCELLED') {
        return { success: false, msg: `Transaction already finished` };
    }

    try {
        const restaurant = await RestaurantModel.findById(transaction.idRestaurant)
            .select('idOwner api')
            .exec();
        if (!restaurant) {
            return { success: false, msg: `Restaurant not found` };
        }

        if (!restaurant.api.posUrl) {
            console.log(`Merchant ${restaurant.idOwner} has not set POS api.`);
            await TransactionModel.findByIdAndUpdate(transaction._id, { status: 'COMPLETED', pos: { isConfirmed: true } }, { new: true })
            return { success: true, msg: { isConfirmed: true } };
        }

        const paymentMethodName = Object.keys(transaction.paymentMethod)[0];

        const items = transaction.cart.orders.map((item) => ({
            ean: item.ean,
            price: (parseFloat(item.price) * item.quantity).toFixed(2),
            quantity: item.quantity,
            note: '',
            mods: '',
        }));

        const totalPrice = items.reduce((acc, item) => acc + parseFloat(item.price), 0) + transaction.tips;

        let paymentId = '';

        switch (paymentMethodName) {
            case 'comgate':
                paymentId = transaction.paymentMethod[paymentMethodName].transId;
                break;
            case 'csob':
                paymentId = transaction.paymentMethod[paymentMethodName].payId;
                break;
            default:
                throw new Error('Unsupported payment gate');
        }

        const data = {
            key: restaurant.api.key,
            totalPrice: totalPrice.toFixed(2),
            tableName: transaction.deliveryMethod.name || 'Table',
            tableId: transaction.deliveryMethod.id || 'ID',
            items: JSON.stringify(items),
            paymentId,
            paymentGate: paymentMethodName,
        };
        const options = { headers: { 'Content-Type': `application/${restaurant.api.contentType}` } };
        const resp = await axios.post(restaurant.api.posUrl, data, options);
        if (!resp.data.success) {
            throw new Error(resp.data.msg);
        }
        const pos = {
            isConfirmed: true,
            callingNumber: resp.data.msg.callingNumber,
            receiptNumber: resp.data.msg.receiptNumber,
        };
        await TransactionModel.findByIdAndUpdate(transaction._id, { status: 'COMPLETED', pos: pos }, { new: true })

        console.log(`Transaction ${transaction.refId} successfully sent.`);
        return { success: true, msg: `Transaction ${transaction.refId} successfully sent.` };
    }
    catch (error) {
        console.log(error)
        if (error.response?.status === 409 && !transaction.pos.isConfirmed) {
            console.log("Transaction " + transaction.refId + " already summited");
            return { success: true, msg: `Transaction ${transaction.refId} successfully sent.` };
        }
        return { success: false, msg: "Failed to send to POS." };
    }
}

module.exports = {
    createTransaction,
    getPaymentMethods,
    runAutoCheckPayment,
    checkPayment,
    runAutoSendToPos,
    sendToPos
}