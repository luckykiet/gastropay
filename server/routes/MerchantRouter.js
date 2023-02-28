const express = require('express');
const config = require('../../src/config/config');
const MerchantController = require('../controllers/MerchantController');
const MERCHANT = config.PATHS.API.MERCHANT;
const RESTAURANT = config.PATHS.API.RESTAURANT;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');

router.post('/' + MERCHANT + '/' + RESTAURANT, authMiddleware.authMiddleware, MerchantController.createRestaurant, authMiddleware.validationHandlerMiddleware);

router.put('/' + MERCHANT, authMiddleware.authMiddleware, MerchantController.updateMerchant, authMiddleware.validationHandlerMiddleware);
router.put('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.updateRestaurant, authMiddleware.validationHandlerMiddleware);

router.delete('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.deleteRestaurant);

router.get('/' + MERCHANT + '/' + RESTAURANT + 's', authMiddleware.authMiddleware, MerchantController.getRestaurants);
router.get('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware.authMiddleware, MerchantController.getRestaurantByID);

module.exports = router;