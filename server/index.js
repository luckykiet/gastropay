const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const connectDB = require('./db');
const restaurantRouter = require('./routes/RestaurantRouter');

const app = express();
const apiPort = 4000;
connectDB();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.use('/api', restaurantRouter);

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));