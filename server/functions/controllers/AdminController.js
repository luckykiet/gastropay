const { isObjectIdOrHexString } = require("mongoose");
const MerchantModel = require("../models/MerchantModel");
const RestaurantModel = require("../models/RestaurantModel");
const ObjectId = require("mongoose").Types.ObjectId;

const createMerchant = async (req, res, next) => {
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
            return res.status(201).json({
                success: true,
                msg: "Merchant with ICO: " + merchant.ico + " created!",
            });
        });
    } catch (error) {
        next(error);
    }
};

const updateMerchant = async (req, res, next) => {
    const merchantId = req.params.id;

    if (!isObjectIdOrHexString(merchantId)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }

    const body = req.body;

    if (!body) {
        return res.status(400).json({
            success: false,
            msg: "You must provide a body to update",
        });
    }

    const merchant = await MerchantModel.findById(merchantId);

    if (!merchant) {
        return res.status(404).json({ success: false, msg: `Merchant not found` });
    }

    try {
        const updatedMerchant = await MerchantModel.findByIdAndUpdate(merchantId, body, { runValidators: true, new: true });

        if (typeof body.isAvailable === 'boolean' && !body.isAvailable && merchant.isAvailable) {
            await RestaurantModel.updateMany({ idOwner: ObjectId(merchantId) }, { isAvailable: false });
        }

        return res.status(200).json({
            success: true,
            msg: updatedMerchant,
        });
    } catch (err) {
        next(err);
    }
};

const deleteMerchant = async (req, res) => {
    if (!isObjectIdOrHexString(req.params.id)) {
        return res.status(400).json({
            success: false,
            msg: "Invalid ID.",
        });
    }
    const merchant = await MerchantModel.findByIdAndDelete(req.params.id);
    if (!merchant) {
        return res
            .status(404)
            .json({ success: false, msg: `Merchant not found` });
    }

    return res
        .status(200)
        .json({
            success: true,
            msg: "Deleted merchant " + merchant.name + " successfully!",
        });
};

const getMerchantByIdOrIco = async (req, res) => {
    let merchant;

    if (req.query.id) {
        if (!isObjectIdOrHexString(req.query.id)) {
            return res.status(400).json({
                success: false,
                msg: "Invalid ID.",
            });
        }
        merchant = await MerchantModel.findById(req.query.id);
    } else if (req.query.ico) {
        merchant = await MerchantModel.findOne({ ico: req.query.ico });
    } else {
        return res
            .status(404)
            .json({ success: false, msg: `Invalid parameters` });
    }

    if (!merchant) {
        return res
            .status(404)
            .json({ success: false, msg: `Merchant not found` });
    }

    return res.status(200).json({ success: true, msg: merchant });
};

const getMerchants = async (req, res) => {
    const sortOrderList = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];

    const query = MerchantModel.find();
    if (req.query.field && req.query.orderBy && sortOrderList.includes(req.query.orderBy)) {
        query.sort({ [req.query.field]: [req.query.orderBy] })
    }
    query.select("_id name ico email isAvailable");
    const merchants = await query.lean().exec();

    if (!merchants.length) {
        return res
            .status(404)
            .json({ success: false, msg: `Merchants not found` });
    }
    return res.status(200).json({ success: true, msg: merchants });
};

const searchMerchants = async (req, res) => {
    const sortOrderList = ['asc', 'desc', 'ascending', 'descending', '1', '-1'];
    const query = MerchantModel.find({
        $or: [
            { name: { $regex: req.query.text, $options: 'i' } },
            { ico: { $regex: req.query.text, $options: 'i' } },
            { email: { $regex: req.query.text, $options: 'i' } },
            { address: { $regex: req.query.text, $options: 'i' } },
        ]
    });
    if (req.query.field && req.query.orderBy && sortOrderList.includes(req.query.orderBy)) {
        query.sort({ [req.query.field]: [req.query.orderBy] })
    } else {
        query.sort({ 'name': 'asc' })
    }
    query.select("_id name ico email isAvailable");
    const merchants = await query.lean().exec();

    if (!merchants.length) {
        return res
            .status(200)
            .json({ success: false, msg: `Merchants not found` });
    }

    return res.status(200).json({ success: true, msg: merchants });
};

module.exports = {
    createMerchant,
    updateMerchant,
    deleteMerchant,
    getMerchantByIdOrIco,
    searchMerchants,
    getMerchants
}