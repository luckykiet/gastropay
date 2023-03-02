const express = require('express');
const config = require('../../src/config/config');
const TransactionController = require('../controllers/TransactionController');
const TRANSACTION = config.PATHS.API.TRANSACTION;
const PAYMENT_METHODS = config.PATHS.API.PAYMENT_METHODS;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');


router.post('/' + TRANSACTION, TransactionController.createTransaction, authMiddleware.validationHandlerMiddleware);

router.get('/' + TRANSACTION + '/:idTransaction', TransactionController.getTransaction);
router.get('/' + TRANSACTION + '/' + PAYMENT_METHODS + '/:idRestaurant', TransactionController.getPaymentMethods);

module.exports = router;