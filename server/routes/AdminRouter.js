const express = require('express');
const config = require('../../src/config/config');
const MerchantController = require('../controllers/MerchantController');
const MERCHANT = config.PATHS.API.MERCHANT;
const RESTAURANT = config.PATHS.API.RESTAURANT;
const router = express.Router();
const authMiddleware = require('./AuthMiddleware');

router.post('/' + MERCHANT + '/' + RESTAURANT, authMiddleware, MerchantController.createRestaurant);

router.put('/' + MERCHANT, authMiddleware, MerchantController.updateMerchant);
router.put('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware, MerchantController.updateRestaurant);

router.delete('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware, MerchantController.deleteRestaurant);

router.get('/' + MERCHANT + '/' + RESTAURANT + 's', authMiddleware, MerchantController.getRestaurants);
router.get('/' + MERCHANT + '/' + RESTAURANT + '/:restaurantId', authMiddleware, MerchantController.getRestaurantByID);

module.exports = router;