const express = require('express');
const config = require('../config/config');
const AdminController = require('../controllers/AdminController');
const MERCHANT = require('../config/api');
const RESTAURANT = require('../config/api');
const router = express.Router();
const authMiddleware = require('./AuthMiddlewares');


module.exports = router;