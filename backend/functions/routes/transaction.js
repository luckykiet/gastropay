const express = require('express');
const TransactionController = require('../controllers/transaction');
const TRANSACTION = require('../config/api').TRANSACTION;
const PAYMENT_METHODS = require('../config/api').PAYMENT_METHODS;
const router = express.Router();
const authMiddleware = require('./auth-middlewares');

router.post('/' + TRANSACTION, TransactionController.createTransaction, authMiddleware.validationHandlerMiddleware);
router.get('/' + TRANSACTION + '/' + PAYMENT_METHODS + '/:idRestaurant', TransactionController.getPaymentMethods);

module.exports = router;
