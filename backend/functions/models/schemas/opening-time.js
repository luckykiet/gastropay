const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OpeningTimeSchema = new Schema({
    monday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    },
    tuesday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    },
    wednesday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    },
    thursday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    },
    friday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    },
    saturday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    },
    sunday: {
        from: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "08:00", required: true
        },
        to: {
            type: String, match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Format HH:mm"], default: "20:00", required: true
        },
        isOpen: { type: Boolean, default: false, required: true }
    }
}, { strict: true, _id: false });

module.exports = OpeningTimeSchema;