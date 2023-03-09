const express = require('express');
const config = require('../config/config').CONFIG;
const AdminController = require('../controllers/AdminController');
const MERCHANT = require('../config/api').API.API.MERCHANT;
const RESTAURANT = require('../config/api').API.API.RESTAURANT;
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');


module.exports = router;