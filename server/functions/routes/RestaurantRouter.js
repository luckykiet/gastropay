const express = require('express');
const RestaurantController = require('../controllers/RestaurantController');
const RESTAURANT = require('../config/api').API.RESTAURANT;
const router = express.Router();

router.get('/' + RESTAURANT + '/:restaurantId', RestaurantController.getRestaurantById);
router.get('/' + RESTAURANT + 's', RestaurantController.getRestaurants);
router.get('/' + RESTAURANT + 's?', RestaurantController.getRestaurants);
router.get('/' + RESTAURANT + 's/search?', RestaurantController.searchRestaurants);


module.exports = router;