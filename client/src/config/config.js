// config.js
import packageJson from '../../package.json';

const DEV_MODE = process.env.REACT_APP_DEV_MODE === 'true' ? true : false;
const API_PORT = process.env.REACT_APP_API_PORT || 4000;
const APP_PORT = process.env.REACT_APP_APP_PORT || 3000;
const LOCALHOST = "http://localhost";
const SERVERLESS_PATH = "/.netlify/functions/server";
const PUBLIC_APP_URL = packageJson.app.url;

const removeSlashFromUrl = (url) => {
    if (url.endsWith('/')) {
        url = url.replace(/\/+$/, '');
    }
    return url;
}

const config = {
    API_PORT: API_PORT,
    APP_PORT: APP_PORT,
    SERVERLESS_PATH: SERVERLESS_PATH,
    API_URL: DEV_MODE ? LOCALHOST + ":" + API_PORT + "/api" : removeSlashFromUrl(PUBLIC_APP_URL) + SERVERLESS_PATH,
    BASE_URL: DEV_MODE ? LOCALHOST + ":" + APP_PORT : removeSlashFromUrl(PUBLIC_APP_URL),
    IMAGE_BASE_URL: DEV_MODE ? LOCALHOST + ":" + APP_PORT + "/images" : removeSlashFromUrl(PUBLIC_APP_URL) + "/images",
    PROXY_URL: "https://cors-proxy.itake.cz",
    LANGUAGES: {
        CS: 'cs',
        EN: 'en'
    },
    JWT_SECRET: "@ThIS iS Sup3rb s3creT!",
};

export { config as CONFIG };