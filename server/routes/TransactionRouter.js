const express = require('express');
const config = require('../../src/config/config');
const TransactionController = require('../controllers/TransactionController');
const TRANSACTION = config.PATHS.API.TRANSACTION;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');


router.post('/' + TRANSACTION, TransactionController.createTransaction, authMiddleware.validationHandlerMiddleware);

module.exports = router;