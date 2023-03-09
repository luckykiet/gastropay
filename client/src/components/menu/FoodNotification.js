import React, { Fragment, useState, useEffect } from 'react';
import { Notification, Button } from 'react-bulma-components';

export default function FoodNotification({ isShowed, msg, color }) {
    const [showNotification, setShowNotification] = useState(isShowed);

    useEffect(() => {
        setShowNotification(isShowed);
    }, [isShowed]);

    return (
        <Fragment>
            {showNotification && (
                <Notification color={color}>
                    {msg}<Button onClick={() => setShowNotification(false)} remove />
                </Notification>
            )}
        </Fragment>
    );
}
