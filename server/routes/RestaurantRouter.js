const express = require('express');
const config = require('../config');
const RestaurantController = require('../controllers/RestaurantController');
const RESTAURANT = config.PATHS.RESTAURANT;
const router = express.Router();
const authMiddleware = require('./AuthMiddleware');

router.post('/' + RESTAURANT, RestaurantController.createRestaurant);
router.put('/' + RESTAURANT + '/:id', RestaurantController.updateRestaurant);
router.delete('/' + RESTAURANT + '/:id', RestaurantController.deleteRestaurant);
router.get('/' + RESTAURANT + '/:id', RestaurantController.getRestaurantById);
router.get('/' + RESTAURANT + 's', RestaurantController.getRestaurants);
router.get('/' + RESTAURANT + 's?', RestaurantController.getRestaurants);
router.get('/' + RESTAURANT + 's/search?', RestaurantController.searchRestaurants);

router.get('/' + RESTAURANT + 's/:merchantId', authMiddleware, RestaurantController.getRestaurantsByMerchantID);

module.exports = router;