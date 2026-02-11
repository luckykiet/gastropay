const express = require('express');
const router = express.Router();
const TRANSACTION = require('../config/api').TRANSACTION;
const GuestController = require('../controllers/guest');

router.get('/' + TRANSACTION + '/:idTransaction', GuestController.getTransaction);
module.exports = router;
