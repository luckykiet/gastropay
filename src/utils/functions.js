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


export const calculateTotalCartPrice = (cartItems) => {
    let totalPrice = 0;
    cartItems.forEach((item) => {
        totalPrice += item.quantity * parseFloat(item.price);
    });
    return Math.round(totalPrice);
}