// Imports
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');
const serverless = require('serverless-http');
const config = require('./config/config')

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

const TransactionController = require('./controllers/TransactionController');
setInterval(TransactionController.runAutoCheckPayment, 20000);

// Inits
const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));
connectDB();

// Define api
app.use('/api', RestaurantRouter);
app.use('/api', GuestRouter);
app.use('/api', cors(corsOnlyAppAllowedOption), MerchantRouter);
app.use('/api', cors(corsOnlyAppAllowedOption), AuthenticateRouter);
app.use('/api', cors(corsOnlyAppAllowedOption), TransactionRouter);

app.use(config.SERVERLESS_PATH, RestaurantRouter);
app.use(config.SERVERLESS_PATH, GuestRouter);
app.use(config.SERVERLESS_PATH, cors(corsOnlyAppAllowedOption), MerchantRouter);
app.use(config.SERVERLESS_PATH, cors(corsOnlyAppAllowedOption), AuthenticateRouter);
app.use(config.SERVERLESS_PATH, cors(corsOnlyAppAllowedOption), TransactionRouter);
module.exports = app;
module.exports.handler = serverless(app);