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
    LANGUAGES: {
        CS: 'cs',
        EN: 'en'
    },
    JWT_SECRET: "@ThIS iS Sup3rb s3creT!",
};

export { config as CONFIG };