import React, { Fragment, useState, useEffect } from 'react';
import { Notification, Button } from 'react-bulma-components';

export default function FoodNotification({ isShowed, msg, color }) {
    const [showNotification, setShowNotification] = useState(isShowed);

    const handleCloseNotification = () => {
        setShowNotification(false);
    }

    useEffect(() => {
        setShowNotification(isShowed);
    }, [isShowed, msg, color]);

    return (
        <Fragment>
            {showNotification && (
                <Notification color={color}>
                    {msg}<Button onClick={handleCloseNotification} remove />
                </Notification>
            )}
        </Fragment>
    );
}
