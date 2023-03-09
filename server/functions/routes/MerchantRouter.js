const express = require('express');
const MerchantController = require('../controllers/MerchantController');
const MERCHANT = require('../config/api').MERCHANT;
const RESTAURANT = require('../config/api').RESTAURANT;
const TRANSACTION = require('../config/api').TRANSACTION;
const CHANGE_PASSWORD = require('../config/api').CHANGE_PASSWORD;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');

router.post('/' + MERCHANT + '/' + RESTAURANT, authMiddleware.authMiddleware, MerchantController.createRestaurant, authMiddleware.validationHandlerMiddleware);

router.put('/' + MERCHANT, authMiddleware.authMiddleware, MerchantController.updateMerchant, authMiddleware.validationHandlerMiddleware);
router.put('/' + MERCHANT + "/" + CHANGE_PASSWORD, authMiddleware.authMiddleware, MerchantController.updatePassword, authMiddleware.validationHandlerMiddleware);
router.put('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.updateRestaurant, authMiddleware.validationHandlerMiddleware);

router.delete('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.deleteRestaurant);

router.get('/' + MERCHANT, authMiddleware.authMiddleware, MerchantController.getSelf, authMiddleware.validationHandlerMiddleware);
router.get('/' + MERCHANT + '/' + RESTAURANT + 's', authMiddleware.authMiddleware, MerchantController.getRestaurants);
router.get('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.getRestaurantByID);
router.get('/' + MERCHANT + '/' + RESTAURANT + '/' + TRANSACTION + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.getRestaurantTransactions);

module.exports = router;