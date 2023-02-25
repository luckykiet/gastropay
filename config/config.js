// config.js
const DEV_MODE = true;
const API_PORT = 4000;
const APP_PORT = 3000;

const config = {
    DEV_MODE: DEV_MODE,
    API_URL: DEV_MODE ? "http://localhost:" + API_PORT : "https://gastropay.ruano.cz",
    BASE_URL: DEV_MODE ? "http://localhost:3000" : "https://gastropay.ruano.cz",
    IMAGE_BASE_URL: DEV_MODE ? "http://localhost:3000/images" : "https://gastropay.ruano.cz/images",
    API_PORT: API_PORT,
    APP_PORT: APP_PORT,
    PATHS: {
        ROUTERS: {
            HOME: '/',
            LOGIN: '/login',
            LOGOUT: '/logout',
            ERROR: '/error',
            CONTACT: '/contact',
            ABOUT: '/about',
            REGISTRATION: '/registration',
            FORGOTTEN_PASS: '/forgottenpassword',
            RESTAURANTS: '/restaurants',
            RESTAURANT: '/restaurant',
            MENU: '/menu',
            ID_RESTAURANT: ':idRestaurant',
            DASHBOARD: "/merchant"
        },
        API: {
            RESTAURANT: "restaurant",
            MERCHANT: "merchant",
            LOGIN: "login",
            PROTECTED: "protected",
            REGISTER: "register"
        }
    },
    LANGUAGES: {
        CS: 'cs',
        EN: 'en'
    },
    JWT_SECRET: "@ThIS iS Sup3rb s3creT!",
};

module.exports = config;