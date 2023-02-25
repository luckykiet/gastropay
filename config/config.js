// config.js
const config = {
    apiUrl: 'http://localhost:5000/api',
    secretKey: 'mysecretkey',
    API_PORT: 4000,
    PATHS: {
        RESTAURANT: "restaurant",
        MERCHANT: "merchant",
        LOGIN: "login",
        PROTECTED: "protected",
        REGISTER: "register"
    },
    JWT_SECRET: "@ThIS iS Sup3rb s3creT!",

};

module.exports = config;