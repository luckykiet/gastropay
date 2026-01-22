const mongoose = require('mongoose');
const RestaurantSchema = require("./schemas/restaurant");

const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);

module.exports = RestaurantModel;
