const { isObjectIdOrHexString } = require("mongoose");
const Restaurant = require("../models/RestaurantModel");
const RestaurantModel = Restaurant.RestaurantModel;
const ObjectId = require("mongoose").Types.ObjectId;

const createRestaurant = async (req, res) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a restaurant",
        });
    }

    const foundRestaurant = await RestaurantModel.findOne({
        idOwner: ObjectId(body.idOwner),
        name: body.name,
        address: body.address,
    }).select("name").exec();

    if (foundRestaurant) {
        return res.status(400).json({
            success: false,
            msg: "Restaurant " + foundRestaurant.name + " already exists!",
        });
    }

    const restaurant = new RestaurantModel(body);

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

    const restaurant = await RestaurantModel.findByIdAndUpdate(req.params.id, body, {
        new: true,
    });

    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }

    return res.status(200).json({
        success: true,
        msg: "Restaurant " + restaurant.name + " updated!",
    });
};

const deleteRestaurant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }
    const restaurant = await RestaurantModel.findByIdAndDelete(req.params.id);
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

    const restaurant = await RestaurantModel.findById(req.params.id);

    if (!restaurant) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurant not found` });
    }
    return res.status(200).json({ success: true, msg: restaurant });
};

const getRestaurants = async (req, res) => {
    const sortOrderList = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];

    const query = RestaurantModel.find();
    if (req.query.field && req.query.orderBy && sortOrderList.includes(req.query.orderBy)) {
        query.sort({ [req.query.field]: [req.query.orderBy] })
    }
    query.select("_id name address openingTime image isAvailable");
    const restaurants = await query.where({ isAvailable: true }).lean().exec();

    if (!restaurants.length) {
        return res
            .status(404)
            .json({ success: false, msg: `Restaurants not found` });
    }
    editTodayAndNextOpeningTime(restaurants);
    return res.status(200).json({ success: true, msg: restaurants });
};

const searchRestaurants = async (req, res) => {
    const sortOrderList = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];
    const query = RestaurantModel.find({
        $or: [
            { name: { $regex: req.query.text, $options: 'i' } },
            { address: { $regex: req.query.text, $options: 'i' } },
        ]
    });

    if (req.query.field && req.query.orderBy && sortOrderList.includes(req.query.orderBy)) {
        query.sort({ [req.query.field]: [req.query.orderBy] })
    } else {
        query.sort({ 'name': 'asc' })
    }
    query.select("_id name address openingTime image isAvailable");
    const restaurants = await query.where({ isAvailable: true }).lean().exec();

    if (!restaurants.length) {
        return res
            .status(200)
            .json({ success: false, msg: `Restaurants not found` });
    }

    editTodayAndNextOpeningTime(restaurants);
    return res.status(200).json({ success: true, msg: restaurants });
};

const editTodayAndNextOpeningTime = (restaurants) => {
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
}

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurants,
    getRestaurantById,
    searchRestaurants
};
