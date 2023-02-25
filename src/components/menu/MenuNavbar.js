import React from 'react';
import { Container, Navbar } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import { calculateCart } from '../../utils';
import packageJson from '../../../package.json';
import CartButton from './CartButton';
import { useCartItems } from '../../stores/ZustandStores';
import { PATHS } from '../../utils';

const { Brand, Item } = Navbar;

export default function MenuNavbar() {
    const cartItems = useCartItems();

    return (
        <Navbar color={'primary'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item className='is-size-3 has-text-weight-bold' renderAs={Link} to={PATHS.ROUTERS.HOME}>
                    {packageJson.app.name}
                </Item>
            </Brand>
            <Navbar.Container align='right'>
                <Container className='has-text-right'>
                    <CartButton numItems={calculateCart(cartItems).totalQuantity} />
                </Container>
            </Navbar.Container>
        </Navbar>
    );
}