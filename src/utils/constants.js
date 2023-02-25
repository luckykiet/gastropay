export const DEV_MODE = true;

export const PATHS = {
    HOME: '/',
    LOGIN: '/login',
    LOG_OUT: '/logout',
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
};

export const LANGUAGES = {
    CS: 'cs',
    EN: 'en'
};

export const BASE_URL = DEV_MODE ? "http://localhost:3000" : "https://gastropay.ruano.cz";
export const IMAGE_BASE_URL = DEV_MODE ? "http://localhost:3000/images" : "https://gastropay.ruano.cz/images";
export const API_PORT = 4000;
export const API_URL = DEV_MODE ? "http://localhost:" + API_PORT : "https://gastropay.ruano.cz";

export const daysOfWeeks = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday"
}

export const daysOfWeeksCzech = {
    "sunday": {
        "shortcut": "Ne",
        "name": "Neděle"
    },
    "monday": {
        "shortcut": "Po",
        "name": "Pondělí"
    },
    "tuesday": {
        "shortcut": "Út",
        "name": "Úterý"
    },
    "wednesday": {
        "shortcut": "St",
        "name": "Středa"
    },
    "thursday": {
        "shortcut": "Čt",
        "name": "Čtvrtek"
    },
    "friday": {
        "shortcut": "Pá",
        "name": "Pátek"
    },
    "saturday": {
        "shortcut": "So",
        "name": "Sobota"
    }
}