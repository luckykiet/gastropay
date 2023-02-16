import React, { Fragment, useState } from 'react';
import ProductCard from './ProductCard';
import FoodNotification from './FoodNotification';

export default function ProductList({ group, content }) {
    const groupedProducts = content.filter((product) => product.group === group);
    const [notification, setNotification] = useState({
        isShowed: false,
        msg: "",
        color: ""
    });

    const handleShowNotification = (isShowed, productName, color) => {
        setNotification({ isShowed: isShowed, msg: "Přidáno " + productName + " do košíku!", color: color });
        setTimeout(() => {
            setNotification({ isShowed: false, msg: "", color: "" });
        }, 3000);
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