import Axios from 'axios';

export const createAxios = (urlAPI) => {
    return Axios.create({ baseURL: urlAPI })
};
