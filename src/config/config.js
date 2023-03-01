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
    MONGODB_URI: 'mongodb://localhost:27017/gastropay',
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
            TRANSACTION: '/transaction',
            ID_TRANSACTION: 'idTransaction',
            ID_RESTAURANT: ':idRestaurant',
            MERCHANT: "/merchant",
            DASHBOARD: "dashboard",
            PROFILE: "profile",
            RESTAURANT_EDIT: "edit",
            RESTAURANT_ADD: "add",
            RESTAURANT_TRANSACTION: "restaurant/transaction",
        },
        API: {
            AUTH: "auth",
            RESTAURANT: "restaurant",
            MERCHANT: "merchant",
            LOGIN: "login",
            PROTECTED: "protected",
            REGISTER: "register",
            ADMIN: "admin",
        }
    },
    LANGUAGES: {
        CS: 'cs',
        EN: 'en'
    },
    JWT_SECRET: "@ThIS iS Sup3rb s3creT!",
    COMGATE: {
        COUNTRIES: ['ALL', 'AT', 'BE', 'CY', 'CZ', 'DE', 'EE', 'EL', 'ES', 'FI', 'FR', 'GB', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SL', 'SK', 'SV', 'US'],
        CURRENCIES: ['CZK', 'EUR', 'PLN', 'HUF', 'USD', 'GBP', 'RON', 'NOK', 'SEK'],
        METHODS: ['ALL', 'CARD_ALL', 'BANK_ALL']
    }
};

module.exports = config;