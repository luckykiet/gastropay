const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;
const Address = require("./AddressModel");
const Comgate = require("./ComgateModel");

const MerchantSchema = new Schema({
    email: { type: String, trim: true, match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/], required: true, unique: true },
    name: { type: String, trim: true, required: true },
    password: { type: String, required: true },
    ico: { type: String, match: [/^\d{8}$/, "Ico with 8 digits"], required: true, unique: true },
    address: { type: Address.AddressSchema, required: true },
    telephone: { type: String, trim: true },
    paymentGates: {
        comgate: { type: Comgate.ComgateSchema, required: true }
    },
    isAvailable: { type: Boolean, required: true, default: true }
}, { timestamps: true });

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

MerchantSchema.methods.comparePassword = function (passwordToCheck, callback) {
    bcrypt.compare(passwordToCheck, this.password, (err, isMatch) => {
        if (err) {
            return callback(err);
        }
        callback(null, isMatch);
    });
};

const MerchantModel = mongoose.model('Merchant', MerchantSchema);

module.exports = {
    MerchantModel,
    MerchantSchema
};
