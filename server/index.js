// Imports
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db');
const API_PORT = 4000;

// Routers
const restaurantRouter = require('./routes/RestaurantRouter');

// Inits
const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));
connectDB();

// Define api
app.use('/api', restaurantRouter);

// Start api
app.listen(API_PORT, () => console.log(`Server running on port ${API_PORT}`));