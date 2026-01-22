const express = require('express');
const AuthController = require('../controllers/auth');
const LOGIN = require('../config/api').LOGIN;
const PROTECTED = require('../config/api').PROTECTED;
const REGISTER = require('../config/api').REGISTER;
const CHANGE_PASSWORD = require('../config/api').CHANGE_PASSWORD;
const AUTH = require('../config/api').AUTH;
const LOGOUT = require('../config/api').LOGOUT;
const router = express.Router();
const authMiddleware = require('./auth-middlewares');

router.post('/' + AUTH + '/' + LOGIN, AuthController.login, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + LOGOUT, AuthController.logout, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + REGISTER, AuthController.register, authMiddleware.validationHandlerMiddleware);
router.post('/' + AUTH + '/' + CHANGE_PASSWORD, AuthController.sendRequestRenewPassword, authMiddleware.validationHandlerMiddleware);

router.put('/' + AUTH + '/' + CHANGE_PASSWORD, authMiddleware.passwordResetTokenVerifyMiddleware, AuthController.updatePassword, authMiddleware.validationHandlerMiddleware);

router.get('/' + AUTH + '/' + CHANGE_PASSWORD, authMiddleware.passwordResetTokenVerifyMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { email: req.email } });
});
router.get('/' + AUTH + '/check?', AuthController.checkMerchantByIcoOrEmail);
router.get('/' + PROTECTED, authMiddleware.authMiddleware, (req, res) => {
    res.status(200).json({ success: true, msg: { userId: req.userId } });
})

module.exports = router;
