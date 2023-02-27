import React, { useState, useEffect } from 'react';
import { createAxios, addSlashAfterUrl, API_URL, getIdFromToken, PATHS } from '../../utils';
import { Promise } from 'bluebird';
export default function DashboardPage() {
    const userId = getIdFromToken();
    const [restaurants, setRestaurants] = useState({});

    useEffect(() => {
        const fetchRestaurants = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}s`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (success) {
                    console.log(msg)
                    setRestaurants(msg)
                }
            } catch (err) {
                console.log(err)
            }
        }
        Promise.delay(0).then(fetchRestaurants);
    }, [userId])

    return (
        <div>DashboardPage</div>
    )
}
