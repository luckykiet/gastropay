import React from 'react';
import { Navbar } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import { PATHS, calculateCart } from '../../utils';
import packageJson from '../../../package.json';
import CartButton from './CartButton';
import { useCartItems } from '../../stores/ZustandStores';

const { Brand, Item, Container } = Navbar;

export default function MenuNavbar() {
    const cartItems = useCartItems();

    return (
        <Navbar color={'primary'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item renderAs={Link} to={PATHS.HOME}>
                    {packageJson.app.name}
                </Item>
            </Brand>
            <Container align='right'>
                <CartButton numItems={calculateCart(cartItems).totalQuantity} />
            </Container>
        </Navbar>
    );
}