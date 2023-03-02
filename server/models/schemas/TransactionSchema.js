const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { nanoid } = require('nanoid');
const Order = require("./OrderSchema");
const uppercaseNumberAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const TransactionSchema = new Schema({
    refId: { type: String, required: true, unique: true, default: () => nanoid(8, uppercaseNumberAlphabet) },
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
    paymentMethod: {
        type: Object,
        required: true,
        validate: [
            {
                validator: function (value) {
                    const paymentMethods = Object.keys(value);
                    return paymentMethods.length === 1 && ['comgate', 'gopay'].includes(paymentMethods[0]);
                },
                message: 'Payment method must be only 1'
            }
        ],
        comgate: {
            transId: { type: String, default: "" },
            status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID'] },
        },
        gopay: {
            transId: { type: String, default: "" },
            status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID'] },
        }
    }
}, { strict: true, timestamps: true });

module.exports = TransactionSchema;
