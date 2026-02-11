const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const Address = require("./AddressSchema");
const Comgate = require("./ComgateSchema");
const Csob = require("./CsobSchema");

const MerchantSchema = new Schema({
    email: { type: String, trim: true, match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/], required: true, unique: true },
    name: { type: String, trim: true },
    password: { type: String, required: true },
    ico: { type: String, match: [/^\d{8}$/, "Ico with 8 digits"], required: true, unique: true },
    address: { type: Address },
    telephone: { type: String, trim: true },
    paymentGates: {
        comgate: { type: Comgate },
        csob: { type: Csob }
    },
    tokens: {
        type: [String],
        default: [],
    },
    isAvailable: { type: Boolean, required: true, default: true }
}, { strict: true, timestamps: true });

MerchantSchema.pre('save', function (next) {
    const user = this;
    const SALT_ROUNDS = 10;
    if (!user.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    });
});

module.exports = MerchantSchema;
