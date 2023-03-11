const jwt = require('jsonwebtoken');
const config = require('../config/config');
const MerchantModel = require("../models/MerchantModel");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        req.userId = decoded.userId;

        const user = await MerchantModel.findOne({ _id: req.userId, tokens: token });
        if (!user) {
            throw new Error();
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

const authAdminMiddleware = (requiredRole) => async (req, res, next) => {
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        req.userId = decoded.userId;
        req.userId = decoded.userId;
        if (requiredRole && decoded.role !== requiredRole) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        const user = await MerchantModel.findOne({ _id: req.userId, tokens: token });
        if (!user) {
            throw new Error();
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

const validationHandlerMiddleware = (err, req, res, next) => {
    if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
        return res.status(422).json({
            success: false,
            msg: Object.keys(err.errors).reduce((errors, key) => {
                errors[key] = err.errors[key].message;
                return errors;
            }, {})
        });
    } else if (err.code === 11000) {
        const fields = Object.keys(err.keyValue);
        const errorMsgs = {};
        fields.forEach(field => {
            errorMsgs[field] = `Duplicate ${field}`;
        });
        return res.status(400).json({
            success: false,
            msg: errorMsgs,
        });
    } else {
        return res.status(500).json({
            success: false,
            msg: err.message
        });
    }
};

module.exports = {
    authMiddleware,
    authAdminMiddleware,
    validationHandlerMiddleware
};