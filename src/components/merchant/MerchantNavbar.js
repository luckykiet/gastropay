import React from 'react';
import { Button, Navbar } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import { PATHS, getItemsFromToken } from '../../utils';

const { Brand, Item } = Navbar;

export default function MerchantNavbar() {
    const ico = getItemsFromToken().ico;
    return (
        <Navbar color={'dark'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item className='is-size-4 has-text-weight-bold' renderAs={Link} to={PATHS.ROUTERS.DASHBOARD}>
                    IČO: {ico}
                </Item>
            </Brand>
            <Navbar.Container align='right'>
                <Button className='is-warning' renderAs={Link} to={PATHS.ROUTERS.LOGOUT}>
                    Odhlásit se
                </Button>
            </Navbar.Container>
        </Navbar>
    );
}