// config.js
const DEV_MODE = true;
const API_PORT = 4000;
const APP_PORT = 3000;

const config = {
    DEV_MODE: DEV_MODE,
    API_PORT: API_PORT,
    APP_PORT: APP_PORT,
    API_URL: DEV_MODE ? "http://localhost:" + API_PORT : "https://gastropay.ruano.cz",
    BASE_URL: DEV_MODE ? "http://localhost:" + APP_PORT : "https://gastropay.ruano.cz",
    IMAGE_BASE_URL: DEV_MODE ? "http://localhost:" + APP_PORT + "/images" : "https://gastropay.ruano.cz/images",
    MONGODB_URI: DEV_MODE ? 'mongodb+srv://luckykiet:51224999@gastropay.k4ezqgk.mongodb.net' : 'mongodb+srv://luckykiet:51224999@gastropay.k4ezqgk.mongodb.net',
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
            PAYMENT: '/payment',
            TRANSACTION: '/transaction',
            MERCHANT: "/merchant",
            DASHBOARD: "dashboard",
            PROFILE: "profile",
            RESTAURANT_EDIT: "edit",
            RESTAURANT_ADD: "add",
            RESTAURANT_TRANSACTION: "transaction",
            ID_TRANSACTION: ':idTransaction',
            ID_RESTAURANT: ':idRestaurant',
        },
        API: {
            AUTH: "auth",
            RESTAURANT: "restaurant",
            MERCHANT: "merchant",
            LOGIN: "login",
            PROTECTED: "protected",
            REGISTER: "register",
            ADMIN: "admin",
            TRANSACTION: "transaction",
            PAYMENT_METHODS: "paymentMethods"
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