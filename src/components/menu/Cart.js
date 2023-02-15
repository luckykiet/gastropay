import React, { Fragment } from 'react'
import { useCartItems, useDecrementCartItem, useIncrementCartItem, useRemoveCartItem } from '../../stores/ZustandStores';
import { calculateCart } from '../../utils';
import { Table, Button } from 'react-bulma-components';
import { faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Cart() {
    const cartItems = useCartItems();
    const incrementCartItem = useIncrementCartItem();
    const decrementCartItem = useDecrementCartItem();
    const removeCartItem = useRemoveCartItem()
    return (
        <Fragment>
            <Table size={'fullwidth'}>
                <thead>
                    <tr>
                        <th>Název</th>
                        <th>Množství</th>
                        <th colSpan={2}>Cena</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>x {item.quantity}</td>
                            <td>{item.quantity * parseFloat(item.price)} Kč</td>
                            <td><Button onClick={() => incrementCartItem(item.id)} size={'small'} color={'white'}><FontAwesomeIcon icon={faPlus} /></Button><Button onClick={() => decrementCartItem(item.id)} size={'small'} color={'white'}><FontAwesomeIcon icon={faMinus} /></Button><Button onClick={() => removeCartItem(item.id)} size={'small'} color={'white'}><FontAwesomeIcon icon={faTrash} /></Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <p>Celkem: {calculateCart(cartItems).totalPrice} Kč</p>
        </Fragment>
    );
};