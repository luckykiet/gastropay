const MerchantModel = require("../models/MerchantModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config').CONFIG;

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await MerchantModel.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, msg: 'Nesprávná kombinace' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ success: false, msg: 'Nesprávná kombinace' });
    }
    const token = signUserToken(user, "1h");
    return res.status(201).json({
        success: true,
        msg: { token: token },
    });
}

const register = async (req, res, next) => {
    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a merchant",
        });
    }

    const foundMerchantByICO = await MerchantModel.findOne({
        ico: body.ico,
    }).select("ico").exec();

    if (foundMerchantByICO) {
        return res.status(200).json({
            success: false,
            msg: "Merchant with ICO:" + foundMerchantByICO.ico + " already exists!",
        });
    }

    const foundMerchantByEmail = await MerchantModel.findOne({
        email: body.email,
    }).select("email").exec();

    if (foundMerchantByEmail) {
        return res.status(200).json({
            success: false,
            msg: "Merchant with email:" + foundMerchantByEmail.email + " already exists!",
        });
    }

    try {
        const merchant = new MerchantModel(body);
        await merchant.save().then(() => {
            const token = signUserToken(merchant, "1h");
            return res.status(201).json({
                success: true,
                msg: { token: token },
            });
        });
    } catch (error) {
        next(error);
    }
};

const checkMerchantByIcoOrEmail = async (req, res) => {
    let merchant = null;
    if (req.query.ico) {
        merchant = await MerchantModel.findOne({ ico: req.query.ico }).select("ico").exec();
    } else if (req.query.email) {
        merchant = await MerchantModel.findOne({ email: req.query.email }).select("email").exec();
    } else {
        return res.status(400).json({ success: false, msg: "Nesprávný parametr!" });
    }
    return res.status(200).json({ success: true, msg: merchant ? true : false });
};

const signUserToken = (user, time) => {
    return jwt.sign({ userId: user._id, ico: user.ico }, config.JWT_SECRET, { expiresIn: time })
}

module.exports = {
    login,
    register,
    checkMerchantByIcoOrEmail
}