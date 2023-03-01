const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Order = require("./OrderSchema");

const TransactionSchema = new Schema({
    refId: { type: String, required: true, unique: true },
    idRestaurant: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID'] },
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
        comgate: {
            transId: { type: String, default: "" },
            status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID'] },
        },
        gopay: {
            transId: { type: String, default: "" },
            status: { type: String, required: true, default: 'PENDING', enum: ['PENDING', 'CANCELLED', 'PAID'] },
        }
    }
}, { strict: true }, { timestamps: true });

TransactionSchema.path('paymentMethod').validate(function (value) {
    return (value.comgate.transId && !value.gopay.transId) || (!value.comgate.transId && value.gopay.transId);
}, 'Only one payment method can be chosen.');

module.exports = TransactionSchema;
