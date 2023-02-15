import React, { Fragment } from 'react'
import { useCartItems } from '../../stores/ZustandStores';
import { calculateCart } from '../../utils';
import { Heading } from 'react-bulma-components';

export default function Cart() {
    const cartItems = useCartItems();
    return (
        <Fragment>
            <Heading size={4}>Cart</Heading>
            <ul>
                {cartItems.map((item) => (
                    <li key={item.id}>
                        {item.name} x {item.quantity} = {item.quantity * parseFloat(item.price)} Kč
                    </li>
                ))}
                <li>Total price: {calculateCart(cartItems).totalPrice}</li>
            </ul>
        </Fragment>
    );
};