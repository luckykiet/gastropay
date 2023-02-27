const express = require('express');
const config = require('../../src/config/config');
const RestaurantController = require('../controllers/RestaurantController');
const RESTAURANT = config.PATHS.API.RESTAURANT;
const router = express.Router();

router.get('/' + RESTAURANT + '/:restaurantId', RestaurantController.getRestaurantById);
router.get('/' + RESTAURANT + 's', RestaurantController.getRestaurants);
router.get('/' + RESTAURANT + 's?', RestaurantController.getRestaurants);
router.get('/' + RESTAURANT + 's/search?', RestaurantController.searchRestaurants);


module.exports = router;