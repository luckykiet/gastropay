import { useState, useEffect } from 'react';
import { createAxios, addSlashAfterUrl, API_URL } from '../../utils';
import { Promise } from 'bluebird';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(API_URL));
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.get('protected', {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    }
                });
                setIsAuthenticated(true);
            } catch (error) {
                !!localStorage.getItem('token') && localStorage.removeItem('token');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (!!localStorage.getItem('token')) {
            Promise.delay(0).then(checkAuth);
        } else {
            setIsLoading(false);
        }
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;
