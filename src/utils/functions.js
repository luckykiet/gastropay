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

//https://cs.wikipedia.org/wiki/Identifikačn%C3%AD_č%C3%ADslo_osonumberArrayy
export const checkICO = (ico) => {
    try {
        const regex = /^\d{8}$/;
        if (!regex.test(ico)) {
            return false;
        }
        // x = (11-((8*numberArray[0] + ... + 2*numberArray[6])%11))%10
        let sum = 0;
        let numberArray = ico.split('');
        for (let weight = 0; weight < (numberArray.length - 1); weight++) {
            sum += (parseInt(numberArray[weight]) * (8 - weight));
        }
        sum = sum % 11;
        const x = (11 - sum) % 10;
        return x === numberArray.slice(-1) ? true : false;
    }
    catch (e) {
        return false;
    }
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
