const axios = require('axios');
const comgateConfig = require('../../config/comgate');
const config = require('../../config/config');
const qs = require('qs');
const createPayment = async (transaction) => {
    try {
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
                "data": JSON.stringify(transaction),
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
            response = await axios.post(comgateConfig.CREATE_URL, qs.stringify(transaction), options);
            params = new URLSearchParams(response.data);
        }
        return { success: true, msg: params };
    } catch (error) {
        return { success: false, msg: error.response?.data ? error.response.data : error };
    }
}

const getPaymentStatus = async (transaction) => {
    try {
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
                "data": JSON.stringify(transaction),
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
            response = await axios.post(comgateConfig.STATUS_URL, qs.stringify(transaction), options);
            params = new URLSearchParams(response.data);
        }
        return { success: true, msg: params };
    } catch (error) {
        return { success: false, msg: error.response?.data ? error.response.data : error };
    }
}

module.exports = {
    createPayment,
    getPaymentStatus,
}
