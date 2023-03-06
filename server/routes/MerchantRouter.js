const express = require('express');
const config = require('../../src/config/config');
const MerchantController = require('../controllers/MerchantController');
const MERCHANT = config.PATHS.API.MERCHANT;
const RESTAURANT = config.PATHS.API.RESTAURANT;
const TRANSACTION = config.PATHS.API.TRANSACTION;
const CHANGE_PASSWORD = config.PATHS.API.CHANGE_PASSWORD;
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