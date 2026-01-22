const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = require("./AddressSchema");
const OpeningTime = require("./OpeningTimeSchema");
const config = require("../../config/config");

const RestaurantSchema = new Schema({
    idOwner: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, trim: true, required: true, unique: true },
    address: { type: Address, required: true },
    api: {
        key: { type: String, trim: true, default: "" },
        verifyUrl: { type: String, trim: true, default: "" },
        menuUrl: { type: String, trim: true, default: "" },
        posUrl: { type: String, trim: true, default: "" },
        contentType: { type: String, trim: true, default: "json", enum: config.SUPPORTED_CONTENT_TYPES },
    },
    image: { type: String, trim: true, default: "" },
    openingTime: { type: OpeningTime, required: true },
    key: { type: Schema.Types.ObjectId, required: true, unique: true, default: () => new mongoose.Types.ObjectId() },
    isAvailable: { type: Boolean, required: true, default: false }
}, { strict: true, timestamps: true });

module.exports = RestaurantSchema;
