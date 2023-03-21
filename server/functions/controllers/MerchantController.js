const { isObjectIdOrHexString } = require("mongoose");
const MerchantModel = require("../models/MerchantModel");
const RestaurantModel = require("../models/RestaurantModel");
const TransactionModel = require("../models/TransactionModel");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const moment = require('moment');
const config = require('../config/config');
const { customAlphabet } = require('nanoid');

const createRestaurant = async (req, res, next) => {
    try {
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

        const restaurant = new RestaurantModel({
            ...body,
            idOwner: ObjectId(authorizedMerchantId),
            openingTime: {},
            paymentGates: {},
            key: ""
        });

        const nanoid = customAlphabet('0123456789', 5)
        const inputString = restaurant._id + config.JWT_SECRET + req.userId + nanoid();
        const objectIdHash = generateRestaurantKey(inputString);
        console.log(objectIdHash);
        restaurant.key = objectIdHash;

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
    try {
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
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

const updateRestaurant = async (req, res, next) => {
    try {
        if (!isObjectIdOrHexString(req.params.restaurantId)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid ID.",
            });
        }

        const body = req.body;

        if (!body || !body.openingTime) {
            return res.status(400).json({
                success: false,
                msg: "You must provide body and opening time to update",
            });
        }

        for (const key in body.openingTime) {
            if (Object.hasOwnProperty.call(body.openingTime, key)) {
                const closingTime = moment(body.openingTime[key].to, "HH:mm");
                const openingTime = moment(body.openingTime[key].from, "HH:mm");
                if (closingTime.isSameOrBefore(openingTime)) {
                    return res.status(400).json({
                        success: false,
                        msg: "Čas otevření nesmí být starší než zavření",
                    });
                }
            }
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
    try {
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
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

const getRestaurantByID = async (req, res) => {
    try {
        const query = RestaurantModel.findOne({ _id: ObjectId(req.params.restaurantId), idOwner: ObjectId(req.userId) });
        query.select("_id name address openingTime image api key isAvailable");
        const restaurant = await query.lean().exec();
        if (!restaurant) {
            return res
                .status(200)
                .json({ success: false, msg: `Restaurants not found` });
        }
        return res.status(200).json({ success: true, msg: restaurant });
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

const getRestaurantTransactions = async (req, res) => {
    try {
        const query = TransactionModel.find({ idRestaurant: ObjectId(req.params.restaurantId) });
        query.sort({ createdAt: 'desc' });

        const transactions = await query.lean().exec();
        if (!transactions) {
            return res
                .status(200)
                .json({ success: false, msg: `Transactions not found` });
        }
        return res.status(200).json({ success: true, msg: transactions });
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

const getSelf = async (req, res, next) => {
    try {
        const authorizedMerchantId = req.userId;
        if (!isObjectIdOrHexString(authorizedMerchantId)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid ID.",
            });
        }
        const merchant = await MerchantModel.findById(authorizedMerchantId);

        if (!merchant) {
            return res
                .status(404)
                .json({ success: false, msg: `Merchant not found` });
        }

        if (!merchant.paymentGates.comgate) {
            merchant.paymentGates.comgate = {};
            await merchant.save();
        }

        if (!merchant.paymentGates.csob) {
            merchant.paymentGates.csob = {};
            await merchant.save();
        }

        return res.status(200).json({ success: true, msg: merchant });
    } catch (error) {
        next(error);
    }
};

const updateMerchant = async (req, res, next) => {
    try {
        const merchantId = req.userId;
        const body = req.body;
        if (!body || !body.password) {
            return res.status(400).json({
                success: false,
                msg: "You must provide a body and password to update",
            });
        }

        const merchant = await MerchantModel.findById(merchantId);

        if (!merchant) {
            return res.status(404).json({
                success: false,
                msg: "Merchant not found"
            });
        }

        const isPasswordValid = await bcrypt.compare(body.password, merchant.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false, msg: {
                    password: 'Nesprávné heslo'
                }
            });
        }

        delete body['password'];

        const paymentGates = merchant.paymentGates || {};

        if (body.paymentGates && body.paymentGates.comgate) {
            paymentGates.comgate = body.paymentGates.comgate;
        }

        if (body.paymentGates && body.paymentGates.csob) {
            paymentGates.csob = body.paymentGates.csob;
        }

        const updatedMerchant = await MerchantModel.findByIdAndUpdate(merchantId, Object.keys(paymentGates).length === 0 ? body : { paymentGates: paymentGates }, { runValidators: true, new: true });
        if (typeof body.isAvailable === 'boolean' && !body.isAvailable && merchant.isAvailable) {
            await RestaurantModel.updateMany({ idOwner: ObjectId(merchantId) }, { isAvailable: false });
        }

        return res.status(200).json({
            success: true,
            msg: updatedMerchant,
        });
    } catch (err) {
        next(err);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const merchantId = req.userId;
        const body = req.body;

        if (!body || !body.currentPassword || !body.newPassword || !body.confirmNewPassword) {
            return res.status(400).json({
                success: false,
                msg: "You must provide a body and password to update",
            });
        }

        if (body.newPassword !== body.confirmNewPassword) {
            return res.status(400).json({
                success: false,
                msg: { confirmNewPassword: "New passwords not matching" },
            });
        }

        const merchant = await MerchantModel.findById(merchantId);

        if (!merchant) {
            return res.status(404).json({
                success: false,
                msg: "Merchant not exist"
            });
        }

        const isPasswordValid = await bcrypt.compare(body.currentPassword, merchant.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                msg: {
                    currentPassword: 'Incorrect password'
                }
            });
        }

        merchant.password = body.newPassword;
        await merchant.save();
        return res.status(200).json({
            success: true,
            msg: "Password successfully changed",
        });
    } catch (err) {
        next(err);
    }
};

const generateRestaurantKey = (inputString) => {
    const hash = crypto.createHash('sha256').update(inputString).digest('hex');
    const objectIdHex = hash.slice(0, 24);
    return objectIdHex;
}

module.exports = {
    createRestaurant,
    updateMerchant,
    deleteRestaurant,
    getRestaurants,
    getRestaurantByID,
    updateRestaurant,
    getSelf,
    getRestaurantTransactions,
    updatePassword
};
