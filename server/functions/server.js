// Imports
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');
const serverless = require('serverless-http');
const config = require('./config/config')
const createError = require('http-errors');
const cookieParser = require('cookie-parser');

// Cors options
const corsOnlyAppAllowedOption = {
    origin: config.BASE_URL,
}

// Routers
const RestaurantRouter = require('./routes/RestaurantRouter');
const MerchantRouter = require('./routes/MerchantRouter');
const AuthenticateRouter = require('./routes/AuthenticateRouter');
const TransactionRouter = require('./routes/TransactionRouter');
const GuestRouter = require('./routes/GuestRouter');
const ProxyRouter = require('./routes/ProxyRouter');

const TransactionController = require('./controllers/TransactionController');
setInterval(TransactionController.runAutoCheckPayment, 20000);

// Inits
const app = express();
app.use(helmet());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
connectDB();

// Define api
app.use('/api', RestaurantRouter);
app.use('/api', GuestRouter);
app.use('/api', ProxyRouter);
app.use('/api', cors(corsOnlyAppAllowedOption), MerchantRouter);
app.use('/api', cors(corsOnlyAppAllowedOption), AuthenticateRouter);
app.use('/api', cors(corsOnlyAppAllowedOption), TransactionRouter);

app.use(config.SERVERLESS_PATH, RestaurantRouter);
app.use(config.SERVERLESS_PATH, GuestRouter);
app.use(config.SERVERLESS_PATH, ProxyRouter);
app.use(config.SERVERLESS_PATH, cors(corsOnlyAppAllowedOption), MerchantRouter);
app.use(config.SERVERLESS_PATH, cors(corsOnlyAppAllowedOption), AuthenticateRouter);
app.use(config.SERVERLESS_PATH, cors(corsOnlyAppAllowedOption), TransactionRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(404);
});

// error handler
app.use((err, req, res, next) => {
    res.sendStatus(err);
});


module.exports = app;
module.exports.handler = serverless(app);