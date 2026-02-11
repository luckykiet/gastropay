const axios = require('axios');
const crypto = require('crypto');
const moment = require('moment');
const csobConfig = require('../../config/csob');

const createPayment = async (privateKey, passphrase, transaction, testMode) => {
    const dataValuesArray = Object.entries(transaction).flatMap(([key, value]) => {
        if (key === 'cart') {
            return value.flatMap(item => Object.values(item));
        }
        return value;
    });

    const message = dataValuesArray.join('|');
    const signature = signMessage(privateKey, passphrase, message);

    if (signature === null) {
        return { success: false, msg: "Failed to sign message" }
    }

    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        const response = await axios.post((testMode ? csobConfig.TEST_URL : csobConfig.PRODUCTION_URL) + '/payment/init', {
            ...transaction,
            signature: signature
        }, config);

        const result = response.data;

        if (result.resultCode === 0) {
            const signature = result.signature;
            delete result['signature'];
            const resultMessage = [
                result.payId,
                result.dttm,
                result.resultCode,
                result.resultMessage,
                result.paymentStatus
            ].join('|');

            if (!verifySignature(resultMessage, signature, testMode)) {
                return { success: false, msg: "Wrong signature!" }
            }
            return { success: true, msg: result }
        }
        return { success: false, msg: result.resultMessage }
    } catch (error) {
        return { success: false, msg: error.response?.data?.resultMessage ? error.response.data.resultMessage : error };
    }
}

const getPaymentStatus = async (privateKey, passphrase, paymentMethod, testMode) => {
    const { merchantId, payId } = paymentMethod;
    const dttm = moment().format('YYYYMMDDHHMMss');
    const messageArray = [merchantId, payId, dttm];
    const message = messageArray.join('|');
    const signature = signMessage(privateKey, passphrase, message);
    if (signature === null) {
        return { success: false, msg: "Failed to sign message" }
    }

    try {
        const response = await axios.get((testMode ? csobConfig.TEST_URL : csobConfig.PRODUCTION_URL) + '/payment/status/' + encodeURIComponent(merchantId) + "/" + encodeURIComponent(payId) + "/" + encodeURIComponent(dttm) + "/" + encodeURIComponent(signature));
        const result = response.data;
        if (result.resultCode === 0) {
            const signature = result.signature;
            delete result['signature'];
            const resultMessage = [
                result.payId,
                result.dttm,
                result.resultCode,
                result.resultMessage,
                result.paymentStatus,
                result.authCode,
                result.statusDetail,
                result.actions
            ].filter(value => value !== undefined).join('|');
            if (!verifySignature(resultMessage, signature, testMode)) {
                return { success: false, msg: "Wrong signature!" }
            }
            return { success: true, msg: result }
        }
        return { success: false, msg: result.resultMessage }
    } catch (error) {
        return { success: false, msg: error.response?.data?.resultMessage ? error.response.data.resultMessage : error };
    }
}

const getPaymentUrl = async (privateKey, passphrase, paymentMethod, testMode) => {
    try {
        const { merchantId, payId } = paymentMethod;
        const dttm = moment().format('YYYYMMDDHHMMss');
        const messageArray = [merchantId, payId, dttm];
        const message = messageArray.join('|');
        const signature = signMessage(privateKey, passphrase, message);
        if (signature === null) {
            return { success: false, msg: "Failed to sign message" }
        }
        const url = (testMode ? csobConfig.TEST_URL : csobConfig.PRODUCTION_URL) + '/payment/process/' + encodeURIComponent(merchantId) + "/" + encodeURIComponent(payId) + "/" + encodeURIComponent(dttm) + "/" + encodeURIComponent(signature);
        return { success: true, msg: url }
    } catch (error) {
        return { success: false, msg: error.response?.data?.resultMessage ? error.response.data.resultMessage : error };
    }
}

const signMessage = (privateKey, passphrase, message) => {
    try {
        const key = trimPemKey(privateKey);
        const privateKeyToSign = crypto.createPrivateKey({
            key: key,
            passphrase: passphrase
        });
        const sign = crypto.createSign('SHA256');
        sign.update(message);
        return sign.sign(privateKeyToSign, 'base64');
    } catch (error) {
        console.log(error)
        return null;
    }
}

const verifySignature = (message, signature, testMode) => {
    try {
        const key = trimPemKey(testMode ? csobConfig.TEST_PRODUCTION_PUB : csobConfig.PRODUCTION_PUB);
        const publicKeyToVerify = crypto.createPublicKey(key);
        const verify = crypto.createVerify('RSA-SHA256');
        verify.update(message);
        return verify.verify(publicKeyToVerify, signature, 'base64');
    } catch (error) {
        console.log(error)
        return false;
    }
}

const trimPemKey = (pem) => {
    const lines = pem.split('\n');
    let encoded = lines[0].trim() + '\n';
    for (let i = 1; i < lines.length - 1; i++) {
        encoded += lines[i].trim();
    }
    encoded += '\n' + lines[lines.length - 1].trim();
    return encoded;
}

module.exports = {
    createPayment,
    getPaymentStatus,
    getPaymentUrl
}