const Restaurant = require('../models/RestaurantModel');

const createRestaurant = async (req, res) => {
    try {
        const body = req.body;
        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a restaurant',
            })
        }

        const restaurant = new Restaurant(body);

        await restaurant.save().then(() => {
            return res.status(201).json({
                success: true,
                id: restaurant._id,
                message: 'Restaurant ' + restaurant.name + ' created!',
            })
        });
    } catch (err) {
        res.status(400).json({
            err,
            message: 'Restaurant not created!',
        });
    }
}

const updateRestaurant = async (req, res) => {
    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    Restaurant.findOne({ _id: req.params.id }, (err, restaurant) => {
        if (err) {
            return res.status(404).json({
                err,
                message: 'Restaurant not found!',
            })
        }
        restaurant.idOwner = body.idOwner
        restaurant.name = body.name
        restaurant.api = body.api
        restaurant.image = body.image
        restaurant.openingTime = body.openingTime
        restaurant
            .save()
            .then(() => {
                return res.status(200).json({
                    success: true,
                    id: restaurant._id,
                    message: 'Restaurant updated!',
                })
            })
            .catch(error => {
                return res.status(404).json({
                    error,
                    message: 'Restaurant not updated!',
                })
            })
    })
}

const deleteRestaurant = async (req, res) => {
    await Restaurant.findOneAndDelete({ _id: req.params.id }, (err, restaurant) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, error: `Restaurant not found` })
        }
        return res.status(200).json({ success: true, msg: "Deleted restaurant " + restaurant.name + " successfully!" })
    }).catch(err => console.log(err))
}

const getRestaurantById = async (req, res) => {
    await Restaurant.findOne({ _id: req.params.id }, (err, restaurant) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, error: `Restaurant not found` })
        }
        return res.status(200).json({ success: true, data: restaurant })
    }).catch(err => console.log(err))
}

const getRestaurants = async (req, res) => {
    await Restaurant.find({}, (err, restaurants) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }

        if (!restaurants.length) {
            return res
                .status(404)
                .json({ success: false, error: `Restaurants not found` })
        }

        return res.status(200).json({ success: true, data: restaurants })
    }).catch(err => console.log(err))
}

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurants,
    getRestaurantById,
}