import React, { useState } from 'react';
import { Button, Navbar } from 'react-bulma-components';
import { Link as RouterLink, NavLink } from 'react-router-dom';
import { PATHS, getItemsFromToken } from '../../utils';

const { Brand, Item, Container, Menu, Dropdown, Burger, Link } = Navbar;
const activeClassName = 'is-active';

const items = [
    {
        path: PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.PROFILE,
        name: 'Profile',
        dividerAfter: true
    },
    {
        path: PATHS.ROUTERS.HOME,
        name: 'Zpět do Gastro Pay',
        dividerAfter: false
    },
]
const NavItems = () => {
    return items.map(({ path, name, dividerAfter }, index) => (
        <div key={index}>
            <NavLink className={({ isActive }) =>
                "navbar-item is-size-5 " + (isActive ? activeClassName : undefined)
            } to={path} >{name}</NavLink>
            {dividerAfter ? <Navbar.Divider /> : ''}
        </div>
    ));
}

export default function MerchantNavbar() {
    const [isBurgerActive, setBurgerActive] = useState(false);
    const ico = getItemsFromToken().ico;
    return (
        <Navbar color={'dark'} role="navigation" aria-label="menu navigation" className='is-spaced has-shadow'>
            <Brand>
                <Item className='is-size-3 has-text-weight-bold' renderAs={RouterLink} to={PATHS.ROUTERS.MERCHANT}>
                    IČO: {ico}
                </Item>
                <Container align='left'>
                    <Burger aria-label="menu" aria-expanded="false" data-target="navbarMain" onClick={() => {
                        setBurgerActive(!isBurgerActive);
                    }} className={
                        isBurgerActive ? activeClassName : undefined
                    } />
                </Container>
            </Brand>
            <Menu id='navbarMain' className={
                isBurgerActive ? activeClassName : undefined
            }>
                <Container align='left'>
                    <Item className='is-size-4' hoverable>
                        <Link>Více</Link>
                        <Dropdown boxed>
                            <NavItems />
                        </Dropdown>
                    </Item>
                </Container>
            </Menu>
            <Container align='right'>
                <Button className='is-warning' renderAs={RouterLink} to={PATHS.ROUTERS.LOGOUT}>
                    Odhlásit se
                </Button>
            </Container>
        </Navbar>
    );
}