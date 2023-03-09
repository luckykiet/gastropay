const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '../../client', '.env');
dotenv.config({ path: envPath });

module.exports = dotenv;
