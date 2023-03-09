// config.js
const DEV_MODE = process.env.REACT_APP_DEV_MODE;
const API_PORT = process.env.REACT_APP_API_PORT || 4000;
const APP_PORT = process.env.REACT_APP_APP_PORT || 3000;

const config = {
    API_PORT: API_PORT,
    APP_PORT: APP_PORT,
    API_URL: DEV_MODE ? "http://localhost:" + API_PORT + "/api" : "https://gastropay.ruano.cz/.netlify/functions/server",
    BASE_URL: DEV_MODE ? "http://localhost:" + APP_PORT : "https://gastropay.ruano.cz",
    IMAGE_BASE_URL: DEV_MODE ? "http://localhost:" + APP_PORT + "/images" : "https://gastropay.ruano.cz/images",
    PROXY_URL: "https://cors-proxy.itake.cz",
    LANGUAGES: {
        CS: 'cs',
        EN: 'en'
    },
    JWT_SECRET: "@ThIS iS Sup3rb s3creT!",
};

export { config as CONFIG };