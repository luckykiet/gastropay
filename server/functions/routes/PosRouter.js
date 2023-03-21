const express = require('express');
const PosController = require('../controllers/PosController');
const POS = require('../config/api').POS;
const CHECK = require('../config/api').CHECK;
const router = express.Router();

const checkRequiredParams = (requiredParams) => {
    return function (req, res, next) {
        const bodyParams = Object.keys(req.body);
        const missingParams = requiredParams.filter(param => !bodyParams.includes(param));
        const emptyParams = bodyParams.filter(param => {
            return (req.body[param] === undefined || req.body[param] === '');
        });
        const extraParams = bodyParams.filter(param => !requiredParams.includes(param));

        if (missingParams.length > 0) {
            return res.status(400).json({ error: `Missing parameters: ${missingParams.join(', ')}` });
        }

        if (emptyParams.length > 0) {
            return res.status(400).json({ error: `Empty parameters: ${emptyParams.join(', ')}` });
        }

        if (extraParams.length > 0) {
            return res.status(400).json({ error: `Unknown parameters: ${extraParams.join(', ')}` });
        }

        next();
    };
}


router.post('/' + POS + '/' + CHECK, checkRequiredParams(["key", "paymentGate", "paymentId"]), PosController.checkTransactionStatus);

module.exports = router;