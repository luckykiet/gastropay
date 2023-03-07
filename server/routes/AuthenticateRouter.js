const express = require('express');
const AuthenticateController = require('../controllers/AuthenticateController');
const LOGIN = require('../config/api').API.LOGIN;
const PROTECTED = require('../config/api').API.PROTECTED;
const REGISTER = require('../config/api').API.REGISTER;
const ADMIN = require('../config/api').API.ADMIN;
const AUTH = require('../config/api').API.AUTH;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');

router.post('/' + AUTH + '/' + LOGIN, AuthenticateController.login, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + REGISTER, AuthenticateController.register, authMiddleware.validationHandlerMiddleware);

router.get('/' + AUTH + '/check?', AuthenticateController.checkMerchantByIcoOrEmail);
router.get('/' + PROTECTED, authMiddleware.authMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})
router.get('/' + ADMIN + '/' + PROTECTED, authMiddleware.authAdminMiddleware(ADMIN), (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})

module.exports = router;