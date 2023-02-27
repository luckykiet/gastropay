const { isObjectIdOrHexString } = require("mongoose");
const Restaurant = require("../models/RestaurantModel");
const RestaurantModel = Restaurant.RestaurantModel;

const getRestaurantById = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.restaurantId)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }

    const query = RestaurantModel.findById(req.params.restaurantId);
    query.select("_id address name openingTime image api isAvailable");
    query.where({ isAvailable: true })
    const restaurant = await query.exec();

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
            { "address.city": { $regex: req.query.text, $options: 'i' } },
            { "address.street": { $regex: req.query.text, $options: 'i' } }
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
    getRestaurants,
    getRestaurantById,
    searchRestaurants
};
