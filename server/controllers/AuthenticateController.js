const Merchant = require("../models/MerchantModel");
const MerchantModel = Merchant.MerchantModel;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await MerchantModel.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ success: false, msg: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, 'secret');
    return res.status(201).json({
        success: true,
        msg: { token: token },
    });
}

const register = async (req, res) => {
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

    const merchant = new MerchantModel(body);

    await merchant.save().then(() => {
        const token = jwt.sign({ userId: merchant._id }, 'secret');
        return res.status(201).json({
            success: true,
            msg: { token: token },
        });
    });
};

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        req.userId = decoded.userId;
        next();
    });
    res.json({ success: true, msg: 'Protected endpoint' });
}

module.exports = {
    login,
    register,
    authenticateToken
}