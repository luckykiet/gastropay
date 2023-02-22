import Axios from 'axios';
import moment from 'moment';

export const createAxios = (urlAPI) => {
    return Axios.create({ baseURL: urlAPI })
};


export const isOpening = (from, to) => {
    const now = moment();
    const openingTime = moment(from, "HH:mm");
    const closingTime = moment(to, "HH:mm");
    return now.isBetween(openingTime, closingTime);
}

export const calculateCart = (cartItems) => {
    let totalQuantity = 0;
    let totalPrice = 0;
    cartItems.forEach((item) => {
        totalPrice += item.quantity * parseFloat(item.price);
        totalQuantity += item.quantity;
    });

    return {
        totalQuantity,
        totalPrice: Math.round(totalPrice),
    };
}

export const addSlashAfterUrl = (url) => {
    if (url && !url.endsWith('/')) {
        url = url + '/';
    }
    return url;
};


export const removeSlashFromUrl = (url) => {
    if (url.endsWith('/')) {
        url = url.replace(/\/+$/, '');
    }
    return url;
}

export const stringToValidFilename = (str) => {
    return str.replace(/[^a-zA-Z0-9._-]/g, '_');
}


export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}