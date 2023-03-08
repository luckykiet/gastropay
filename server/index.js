// Start api
const config = require('./config/config').CONFIG;
const app = require('./server');

const PORT = process.env.REACT_APP_API_PORT || config.API_PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));