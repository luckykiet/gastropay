const { isObjectIdOrHexString } = require("mongoose");
const MerchantModel = require("../models/MerchantModel");
const RestaurantModel = require("../models/RestaurantModel");
const ObjectId = require("mongoose").Types.ObjectId;

const createRestaurant = async (req, res, next) => {
    const authorizedMerchantId = req.userId;
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a restaurant",
        });
    }

    const foundRestaurant = await RestaurantModel.findOne({
        idOwner: ObjectId(authorizedMerchantId),
        name: body.name
    }).select("name").exec();

    if (foundRestaurant) {
        return res.status(400).json({
            success: false,
            msg: "Restaurant " + foundRestaurant.name + " already exists!",
        });
    }

    try {
        const restaurant = new RestaurantModel({
            ...body,
            idOwner: ObjectId(authorizedMerchantId),
            openingTime: {}
        });
        await restaurant.save().then(() => {
            return res.status(200).json({
                success: true,
                msg: restaurant,
            });
        });
    } catch (error) {
        next(error);
    }

};

const getRestaurants = async (req, res) => {
    const query = RestaurantModel.find({ idOwner: ObjectId(req.userId) });
    query.sort({ createdAt: "desc" })
    query.select("_id name address openingTime image isAvailable");
    const restaurants = await query.lean().exec();
    if (!restaurants.length) {
        return res
            .status(200)
            .json({ success: false, msg: `Restaurants not found` });
    }
    return res.status(200).json({ success: true, msg: restaurants });
};

const updateRestaurant = async (req, res, next) => {
    if (!isObjectIdOrHexString(req.params.restaurantId)) {
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

    const foundRestaurants = await RestaurantModel.find({
        idOwner: ObjectId(body.idOwner),
        name: body.name
    }).select("name").exec();

    if (foundRestaurants.length > 1) {
        return res.status(400).json({
            success: false,
            msg: "Restaurant " + foundRestaurants[0].name + " already exists!",
        });
    }

    try {
        const restaurant = await RestaurantModel.findOneAndUpdate({ _id: ObjectId(req.params.restaurantId), idOwner: ObjectId(req.userId) }, body, { new: true, runValidators: true });

        if (!restaurant) {
            return res
                .status(404)
                .json({ success: false, msg: `Restaurant not found` });
        }

        return res.status(200).json({
            success: true,
            msg: "Restaurant " + restaurant.name + " updated!",
        });
    } catch (error) {
        next(error);
    }
};

const deleteRestaurant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.restaurantId)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }
    const restaurant = await RestaurantModel.findOneAndDelete({ _id: ObjectId(req.params.restaurantId), idOwner: ObjectId(req.userId) });
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

const getRestaurantByID = async (req, res) => {

    const query = RestaurantModel.findOne({ _id: ObjectId(req.params.restaurantId), idOwner: ObjectId(req.userId) });
    query.select("_id name address openingTime image api isAvailable");
    const restaurant = await query.lean().exec();
    if (!restaurant) {
        return res
            .status(200)
            .json({ success: false, msg: `Restaurants not found` });
    }
    return res.status(200).json({ success: true, msg: restaurant });
};

const updateMerchant = async (req, res, next) => {
    const merchantId = req.userId;

    if (!isObjectIdOrHexString(merchantId)) {
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

    const merchant = await MerchantModel.findById(merchantId);

    if (!merchant) {
        return res.status(404).json({ success: false, msg: `Merchant not found` });
    }

    try {
        if (typeof body.isAvailable === 'boolean' && !body.isAvailable && merchant.isAvailable) {
            await RestaurantModel.updateMany({ idOwner: ObjectId(merchantId) }, { isAvailable: false });
        }
        await merchant.updateOne(body, { runValidators: true });
        return res.status(200).json({
            success: true,
            msg: `Merchant ${merchant.name} updated!`,
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createRestaurant,
    updateMerchant,
    deleteRestaurant,
    getRestaurants,
    getRestaurantByID,
    updateRestaurant
};
