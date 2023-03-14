const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Order = require("./OrderSchema");
const { customAlphabet } = require('nanoid');
const uppercaseNumberAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const numberAlphabet = '0123456789';
const nanoid = customAlphabet(uppercaseNumberAlphabet, 8);
const nanoidNumberOnly = customAlphabet(numberAlphabet, 8);
const moment = require('moment');

const TransactionSchema = new Schema({
    refId: { type: String, required: true, unique: true, default: () => nanoid() },
    idRestaurant: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID', 'COMPLETED'] },
    cart: {
        orders: {
            type: [Order], required: true, validate: {
                validator: function (orders) {
                    return orders.length > 0;
                },
                message: 'Orders must contain at least one order.'
            }
        },
        isConfirmed: { type: Boolean, required: true, default: false }
    },
    tips: { type: Number, required: true, default: 0 },
    deliveryMethod: { type: String, default: "" },
    email: { type: String, trim: true, match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/], required: true },
    paymentMethod: {
        type: Object,
        required: true,
        validate: [
            {
                validator: function (value) {
                    const paymentMethods = Object.keys(value);
                    return paymentMethods.length === 1 && ['comgate', 'csob'].includes(paymentMethods[0]);
                },
                message: 'Payment method must be only 1'
            }
        ],
        comgate: {
            transId: { type: String, default: "" },
            status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID'] },
        },
        csob: {
            payId: { type: String, required: true, default: "" },
            orderNo: { type: String, required: true, trim: true, default: () => nanoidNumberOnly(), match: [/^\d{8}$/] },
            ddtm: {
                type: Date,
                validate: {
                    validator: function (v) {
                        return /^\d{14}$/.test(moment(v, 'YYYYMMDDHHMMss'));
                    },
                    message: props => `${props.value} is not a valid date format (YYYYMMDDHHMMss)`
                },
                required: true
            },
            status: { type: Number, required: true, default: 2, min: 1, max: 10 },
        }
    }
}, { strict: true, timestamps: true });

module.exports = TransactionSchema;
