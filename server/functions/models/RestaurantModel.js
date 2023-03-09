const mongoose = require('mongoose');
const RestaurantSchema = require("./schemas/RestaurantSchema");

const RestaurantModel = mongoose.model('Restaurant', RestaurantSchema);

module.exports = RestaurantModel;
