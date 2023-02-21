const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const restaurantSchema = new Schema({
    idOwner: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, trim: true, required: true },
    address: {
        street: { type: String, trim: true, required: true },
        city: { type: String, trim: true, required: true },
        postalCode: { type: String, required: true, match: [/^\d{3} ?\d{2}$/, "Postal code must be: 11000 or 110 00"] }
    },
    api: {
        baseUrl: { type: String, trim: true },
        params: { type: String, trim: true }
    },
    image: { type: String, trim: true },
    openingTime: {
        monday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.monday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.monday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        },
        tuesday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.tuesday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.tuesday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        },
        wednesday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.wednesday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.wednesday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        },
        thursday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.thursday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.thursday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        },
        friday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.friday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.friday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        },
        saturday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.saturday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.saturday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        },
        sunday: {
            from: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.sunday.isOpen;
                }
            },
            to: {
                type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], required: function () {
                    return this.openingTime.sunday.isOpen;
                }
            },
            isOpen: { type: Boolean, default: false, required: true }
        }
    },
    isAvailable: { type: Boolean, required: true, default: false }
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
