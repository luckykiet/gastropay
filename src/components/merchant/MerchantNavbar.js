import React from 'react';
import { Button, Navbar } from 'react-bulma-components';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../utils';
import packageJson from '../../../package.json';
import { useSetLoggedIn } from '../../stores/ZustandStores';

const { Brand, Item } = Navbar;

export default function MerchantNavbar() {
    const setLoggedIn = useSetLoggedIn();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setLoggedIn(false);
        navigate(PATHS.HOME);
    }

    return (
        <Navbar color={'dark'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item className='is-size-3 has-text-weight-bold' renderAs={Link} to={PATHS.HOME}>
                    {packageJson.app.name}
                </Item>
            </Brand>
            <Navbar.Container align='right'>
                <Item>
                    <Button color={'warning'} onClick={handleLogout}>Odhlásit se</Button>
                </Item>
            </Navbar.Container>
        </Navbar>
    );
}