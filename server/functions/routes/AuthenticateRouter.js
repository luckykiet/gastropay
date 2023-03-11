const express = require('express');
const AuthenticateController = require('../controllers/AuthenticateController');
const LOGIN = require('../config/api').LOGIN;
const PROTECTED = require('../config/api').PROTECTED;
const REGISTER = require('../config/api').REGISTER;
const ADMIN = require('../config/api').ADMIN;
const AUTH = require('../config/api').AUTH;
const LOGOUT = require('../config/api').LOGOUT;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');

router.post('/' + AUTH + '/' + LOGIN, AuthenticateController.login, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + LOGOUT, AuthenticateController.logout, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + REGISTER, AuthenticateController.register, authMiddleware.validationHandlerMiddleware);

router.get('/' + AUTH + '/check?', AuthenticateController.checkMerchantByIcoOrEmail);
router.get('/' + PROTECTED, authMiddleware.authMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})
router.get('/' + ADMIN + '/' + PROTECTED, authMiddleware.authAdminMiddleware(ADMIN), (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})

module.exports = router;