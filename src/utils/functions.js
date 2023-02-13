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