const { isObjectIdOrHexString } = require('mongoose');
const Restaurant = require('../models/RestaurantModel');
const ObjectId = require('mongoose').Types.ObjectId;

const createRestaurant = (req, res) => {
    try {
        const body = req.body;
        if (!body) {
            return res.status(400).json({
                success: false,
                msg: 'You must provide a restaurant',
            })
        }
        const query = Restaurant.findOne({ idOwner: ObjectId(body.idOwner), 'name': body.name, address: body.address });
        query.select("name");
        query.exec(async function (error, foundRestaurant) {
            if (error || foundRestaurant) {
                return res.status(400).json({
                    success: false,
                    msg: error ? error : 'Restaurant ' + foundRestaurant.name + ' already exists!',
                })
            }

            const restaurant = new Restaurant(body);

            await restaurant.save().then(() => {
                return res.status(201).json({
                    success: true,
                    msg: 'Restaurant ' + restaurant.name + ' created!',
                })
            });
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            msg: err,
        });
    }
}

const updateRestaurant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid ID.',
        })
    }

    const body = req.body

    if (!body) {
        return res.status(400).json({
            success: false,
            msg: 'You must provide a body to update',
        })
    }

    await Restaurant.findOne({ _id: ObjectId(req.params.id) }, (err, restaurant) => {
        if (err) {
            return res.status(404).json({
                success: false,
                msg: err
            })
        }

        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, msg: `Restaurant not found` })
        }

        restaurant.name = body.name
        restaurant.address = body.address
        restaurant.api = body.api
        restaurant.image = body.image
        restaurant.openingTime = body.openingTime
        restaurant
            .save()
            .then(() => {
                return res.status(200).json({
                    success: true,
                    msg: 'Restaurant ' + restaurant.name + ' updated!',
                })
            })
            .catch(err => {
                return res.status(404).json({
                    success: false,
                    msg: err,
                })
            })
    })
}

const deleteRestaurant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid ID.',
        })
    }

    await Restaurant.findOneAndDelete({ _id: ObjectId(req.params.id) }, (err, restaurant) => {
        if (err) {
            return res.status(400).json({ success: false, msg: err })
        }

        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, msg: `Restaurant not found` })
        }
        return res.status(200).json({ success: true, msg: "Deleted restaurant " + restaurant.name + " successfully!" })
    }).catch(err => console.log(err))
}

const getRestaurantById = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: 'Invalid ID.',
        })
    }

    await Restaurant.findOne({ _id: ObjectId(req.params.id) }, (err, restaurant) => {
        if (err) {
            return res.status(400).json({ success: false, msg: err })
        }

        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, msg: `Restaurant not found` })
        }
        return res.status(200).json({ success: true, msg: restaurant })
    }).catch(err => console.log(err))
}

const getRestaurants = async (req, res) => {
    await Restaurant.find({}, (err, restaurants) => {
        if (err) {
            return res.status(400).json({ success: false, msg: err })
        }

        if (!restaurants.length) {
            return res
                .status(404)
                .json({ success: false, msg: `Restaurants not found` })
        }

        return res.status(200).json({ success: true, msg: restaurants })
    }).catch(err => console.log(err))
}

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurants,
    getRestaurantById,
}