// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');
const serverless = require('serverless-http');

// Routers
const RestaurantRouter = require('./routes/RestaurantRouter');
const MerchantRouter = require('./routes/MerchantRouter');
const AuthenticateRouter = require('./routes/AuthenticateRouter');
const TransactionRouter = require('./routes/TransactionRouter');

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
app.use('/api', MerchantRouter);
app.use('', AuthenticateRouter);
app.use('/api', TransactionRouter);

app.use('/.netlify/functions/server', RestaurantRouter);
app.use('/.netlify/functions/server', MerchantRouter);
app.use('/.netlify/functions/server', AuthenticateRouter);
app.use('/.netlify/functions/server', TransactionRouter);
module.exports = app;
module.exports.handler = serverless(app);