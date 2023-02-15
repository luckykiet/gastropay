import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bulma-components';

const CartButton = ({ numItems, handleShowCart }) => {
    return (
        <Button color={'primary'} onClick={handleShowCart}>
            <FontAwesomeIcon icon={faCartShopping} size='lg' />
            {numItems > 0 && <span>&nbsp;{numItems} x</span>}
        </Button>
    );
};

export default CartButton;