import Axios from 'axios';
import moment from 'moment';

export const createAxios = (urlAPI) => {
    return Axios.create({ baseURL: urlAPI })
};

export const isOpening = (beginTime, endTime) => {
    const formattedBeginTime = moment(beginTime, "HH:mm");
    const formattedEndTime = moment(endTime, "HH:mm");
    const currentTime = moment();
    return currentTime.isBefore(formattedEndTime) && currentTime.isAfter(formattedBeginTime) ? true : false;
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
    if (!url.endsWith('/')) {
        url = url + '/';
    }
    return url;
};

export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
}