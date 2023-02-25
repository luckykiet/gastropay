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
                const response = await axios.get('protected', {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });
                if (response.data.success) {
                    setIsAuthenticated(true);
                }
            } catch (error) {
                !!localStorage.getItem('token') && localStorage.removeItem('token');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        if (!!localStorage.getItem('token')) {
            Promise.delay(500).then(checkAuth);
        } else {
            setIsLoading(false);
        }
    }, []);

    return { isAuthenticated, isLoading };
};

export default useAuth;
