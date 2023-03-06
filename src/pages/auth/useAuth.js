import { useState, useEffect } from 'react';
import { createAxios, addSlashAfterUrl, API_URL } from '../../utils';
import { Promise } from 'bluebird';
import { PATHS } from '../../utils';
import jwtDecode from 'jwt-decode';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expirationTime, setExpirationTime] = useState(null);

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(API_URL));
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    return;
                }
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decodedToken.exp < currentTime) {
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                    setIsLoading(false);
                    setError({ message: 'Token expired' });
                    return;
                }
                setExpirationTime(decodedToken.exp);
                await axios.get(`${PATHS.API.PROTECTED}`, {
                    headers: {
                        Authorization: 'Bearer ' + token,
                    }
                });
                setIsAuthenticated(true);
                setIsLoading(false);
            } catch (error) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setIsLoading(false);
                setError(error);
            }
        };

        Promise.delay(0).then(checkAuth);
    }, []);

    return { isAuthenticated, isLoading, error, expirationTime };
};

export default useAuth;
