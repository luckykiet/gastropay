const { isObjectIdOrHexString } = require("mongoose");
const Restaurant = require("../models/RestaurantModel");
const ObjectId = require("mongoose").Types.ObjectId;

const createRestaurant = async (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a restaurant",
        });
    }
    const query = Restaurant.findOne({
        idOwner: ObjectId(body.idOwner),
        name: body.name,
        address: body.address,
    });
    query.select("name");

    const foundRestaurant = await query.exec();
    if (foundRestaurant) {
        return res.status(400).json({
            success: false,
            msg: "Restaurant " + foundRestaurant.name + " already exists!",
        });
    }

    const restaurant = new Restaurant(body);

    await restaurant.save().then(() => {
        return res.status(201).json({
            success: true,
            msg: "Restaurant " + restaurant.name + " created!",
        });
    });
};

const updateRestaurant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }

    const body = req.body;

    if (!body) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a body to update",
        });
    }

    const restaurant = await Restaurant.findOne({ _id: ObjectId(req.params.id) });
    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }

    restaurant.name = body.name;
    restaurant.address = body.address;
    restaurant.api = body.api;
    restaurant.image = body.image;
    restaurant.openingTime = body.openingTime;
    await restaurant
        .save()
        .then(() => {
            return res.status(200).json({
                success: true,
                msg: "Restaurant " + restaurant.name + " updated!",
            });
        })
        .catch((err) => {
            return res.status(404).json({ success: false, msg: err });
        });
};

const deleteRestaurant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }
    const restaurant = await Restaurant.findOneAndDelete({
        _id: ObjectId(req.params.id),
    });
    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }

    return res
        .status(200)
        .json({
            success: true,
            msg: "Deleted restaurant " + restaurant.name + " successfully!",
        });
};

const getRestaurantById = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }

    const restaurant = await Restaurant.findOne({ _id: ObjectId(req.params.id) });

    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }
    return res.status(200).json({ success: true, msg: restaurant });
};

const getRestaurants = async (req, res) => {
    const restaurants = await Restaurant.find().lean().exec();

    if (!restaurants.length) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurants not found` });
    }

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    const dateObj = new Date();
    const today = dateObj.getDay();

    for (let index = 0; index < restaurants.length; index++) {
        let sortedOpeningTime = {};
        for (let j = 0; j < days.length; j++) {
            sortedOpeningTime[days[j]] = restaurants[index].openingTime[days[j]];
        }
        const nextDays = Object.entries(sortedOpeningTime);
        const sliceIndex = today === 6 ? 0 : (today + 1) % 7;
        const splicedPart = nextDays.splice(0, sliceIndex);
        Array.prototype.push.apply(nextDays, splicedPart);

        const nextDayOpen = nextDays.find((day) => day[1].isOpen);
        const todayOpeningTime = { today: sortedOpeningTime[days[today]] };
        const nextOpeningTime = nextDayOpen
            ? { [nextDayOpen[0]]: sortedOpeningTime[nextDayOpen[0]] }
            : { isOpen: false };
        restaurants[index].openingTime = todayOpeningTime;
        restaurants[index].nextOpenTime = nextOpeningTime;
    }

    return res.status(200).json({ success: true, msg: restaurants });
};

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurants,
    getRestaurantById,
};
