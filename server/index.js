// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');
const config = require('./config/config').CONFIG;

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

// Start api
app.listen(config.API_PORT, () => console.log(`Server running on port ${config.API_PORT}`));