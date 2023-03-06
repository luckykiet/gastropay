const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = require("./AddressSchema");
const OpeningTime = require("./OpeningTimeSchema");

const RestaurantSchema = new Schema({
    idOwner: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, trim: true, required: true, unique: true },
    address: { type: Address, required: true },
    api: {
        baseUrl: { type: String, trim: true, default: "" },
        params: { type: String, trim: true, default: "" }
    },
    image: { type: String, trim: true, default: "" },
    openingTime: { type: OpeningTime, required: true },
    isAvailable: { type: Boolean, required: true, default: false }
}, { strict: true, timestamps: true });

module.exports = RestaurantSchema;
