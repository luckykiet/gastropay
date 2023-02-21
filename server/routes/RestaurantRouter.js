const express = require('express');

const RestaurantController = require('../controllers/RestaurantController');

const router = express.Router();

router.post('/restaurant', RestaurantController.createRestaurant);
router.put('/restaurant/:id', RestaurantController.updateRestaurant);
router.delete('/restaurant/:id', RestaurantController.deleteRestaurant);
router.get('/restaurant/:id', RestaurantController.getRestaurantById);
router.get('/restaurants', RestaurantController.getRestaurants);
router.get('/restaurants&:field&:orderBy', RestaurantController.getRestaurants);

module.exports = router;