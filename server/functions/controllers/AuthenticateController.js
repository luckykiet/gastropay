const MerchantModel = require("../models/MerchantModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const api = require('../config/api');
const mail = require('../config/mail');
const sendMailWrapper = require('../mail_sender');

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await MerchantModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, msg: 'Nesprávná kombinace' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, msg: 'Nesprávná kombinace' });
        }
        const token = signItemToken({ userId: user._id, ico: user.ico }, "1h");
        await MerchantModel.findByIdAndUpdate(user._id, { $push: { tokens: token } });
        return res.status(201).json({
            success: true,
            msg: { token: token },
        });
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        const { token } = req.body;
        await MerchantModel.updateOne({ tokens: token }, { $pull: { tokens: token } });
        res.json({
            success: true,
            msg: "Logout successful"
        });
    } catch (error) {
        next(error)
    }
}

const register = async (req, res, next) => {
    try {
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
            const token = signItemToken({ userId: merchant._id, ico: merchant.ico }, "1h");
            return res.status(201).json({
                success: true,
                msg: { token: token },
            });
        });
    } catch (error) {
        next(error);
    }
};

const sendRequestRenewPassword = async (req, res, next) => {
    try {
        const useSendMail = mail.USE_SEND_MAIL;
        if (useSendMail) {
            const email = req.body.email;
            const user = await MerchantModel.findOne({ email: email });
            if (!user) {
                return res.status(404).json({ success: false, msg: 'Email není registrován' });
            }
            const token = signItemToken({ email }, '15m');
            await MerchantModel.findByIdAndUpdate(user._id, { $push: { tokens: token } });
            await sendMailWrapper(email,
                "Obnovení hesla pro účet IČO: " + user.ico,
                config.APP_NAME + " - Obnovení hesla pro účet IČO: " + user.ico,
                "Pro obnovení hesla klikněte na tento <a href='" + config.BASE_URL + "/" + api.CHANGE_PASSWORD + "/" + token + "' target='_blank' style='background-color: #ff3860;padding: 8px 12px;border-radius: 2px;font-size: 20px; color: #f5f5f5;text-decoration: none;font-weight:bold;display: inline-block;'>Odkaz k obnovení hesla</a>",
                "Pokud jste požadavek neprováděl(a), ignorujte tento email."
            );

            return res.status(200).json({
                success: true,
                msg: "Password reset request has been sent to your email",
            });
        } else {
            return res.status(400).json({
                success: false,
                msg: "Password reset is not available",
            });
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const checkMerchantByIcoOrEmail = async (req, res) => {
    try {
        let merchant = null;
        if (req.query.ico) {
            merchant = await MerchantModel.findOne({ ico: req.query.ico }).select("ico").exec();
        } else if (req.query.email) {
            merchant = await MerchantModel.findOne({ email: req.query.email }).select("email").exec();
        } else {
            return res.status(400).json({ success: false, msg: "Nesprávný parametr!" });
        }
        return res.status(200).json({ success: true, msg: merchant ? true : false });
    } catch (error) {
        return res.status(400).json({ success: false, msg: error });
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const email = req.email;
        const body = req.body;
        if (!body || !body.newPassword || !body.confirmNewPassword) {
            return res.status(400).json({
                success: false,
                msg: "You must provide a body and password to update",
            });
        }

        if (body.newPassword !== body.confirmNewPassword) {
            return res.status(400).json({
                success: false,
                msg: { confirmNewPassword: "New passwords not matching" },
            });
        }

        const merchant = await MerchantModel.findOne({ email: email });

        if (!merchant) {
            return res.status(404).json({
                success: false,
                msg: "Merchant not exist"
            });
        }

        merchant.password = body.newPassword;
        merchant.tokens = [];
        await merchant.save();
        return res.status(200).json({
            success: true,
            msg: "Password successfully changed",
        });
    } catch (err) {
        next(err);
    }
};

const signItemToken = (item, time) => {
    return jwt.sign(item, config.JWT_SECRET, { expiresIn: time })
}

module.exports = {
    login,
    logout,
    register,
    sendRequestRenewPassword,
    checkMerchantByIcoOrEmail,
    updatePassword
}