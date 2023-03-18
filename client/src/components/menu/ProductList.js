import React, { Fragment, useReducer } from 'react';
import ProductCard from './ProductCard';
import FoodNotification from './FoodNotification';

const NOTIFICATION_DURATION = 3000;

const notificationReducer = (state, action) => {
    switch (action.type) {
        case 'SHOW':
            return {
                isShowed: true,
                msg: action.msg,
                color: action.color
            };
        case 'HIDE':
            return {
                isShowed: false,
                msg: '',
                color: ''
            };
        default:
            return state;
    }
};

export default function ProductList({ group, content }) {
    const groupedProducts = content.filter((product) => product.tab === group);

    const [notification, dispatch] = useReducer(notificationReducer, {
        isShowed: false,
        msg: '',
        color: ''
    });

    const handleShowNotification = (productName, color) => {
        dispatch({ type: 'SHOW', msg: `Přidáno ${productName} do košíku!`, color: color });

        setTimeout(() => {
            dispatch({ type: 'HIDE' });
        }, NOTIFICATION_DURATION);
    };

    return (
        <Fragment key={group}>
            {groupedProducts.map((product) => (
                <ProductCard key={product.ean} product={product} showNotification={handleShowNotification} />
            ))}
            {notification.isShowed && <FoodNotification isShowed={notification.isShowed} msg={notification.msg} color={notification.color} />}
        </Fragment>
    );
}
