import React from 'react';
import { Navbar } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import { calculateCart } from '../../utils';
import packageJson from '../../../package.json';
import CartButton from './CartButton';
import { useCartItems } from '../../stores/ZustandStores';
import { PATHS } from '../../config/paths';

const { Brand, Item } = Navbar;

export default function MenuNavbar({ showSidebar }) {
    const cartItems = useCartItems();

    return (
        <Navbar color={'primary'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item className='is-size-4 has-text-weight-bold' renderAs={Link} to={PATHS.HOME}>
                    {packageJson.app.name}
                </Item>
            </Brand>
            <div className="navbar-end">
                <CartButton showSidebar={showSidebar} numItems={calculateCart(cartItems).totalQuantity} />
            </div>
        </Navbar>
    );
}