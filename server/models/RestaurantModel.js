const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
    idOwner: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    api: {
        baseUrl: { type: String },
        params: { type: String }
    },
    image: { type: String },
    openingTime: {
        monday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        },
        tuesday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        },
        wednesday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        },
        thursday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        },
        friday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        },
        saturday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        },
        sunday: {
            from: { type: String },
            to: { type: String },
            status: { type: String, enum: ["open", "closed"], default: "closed" }
        }
    }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
