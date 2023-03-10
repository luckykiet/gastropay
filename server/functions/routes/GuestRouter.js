const express = require('express');
const router = express.Router();
const TRANSACTION = require('../config/api').TRANSACTION;
const GuestController = require('../controllers/GuestController');

router.get('/' + TRANSACTION + '/:idTransaction', GuestController.getTransaction);
module.exports = router;