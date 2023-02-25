import React from 'react';
import { Button, Navbar } from 'react-bulma-components';
import { Link } from 'react-router-dom';
import packageJson from '../../../package.json';
import config from '../../config/config';

const { Brand, Item } = Navbar;

export default function MerchantNavbar() {
    return (
        <Navbar color={'dark'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item className='is-size-3 has-text-weight-bold' renderAs={Link} to={config.PATHS.ROUTERS.HOME}>
                    {packageJson.app.name}
                </Item>
            </Brand>
            <Navbar.Container align='right'>
                <Button className='is-warning' renderAs={Link} to={config.PATHS.ROUTERS.LOGOUT}>
                    Odhlásit se
                </Button>
            </Navbar.Container>
        </Navbar>
    );
}