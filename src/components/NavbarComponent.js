import { Link as RouterLink, NavLink } from 'react-router-dom';
import packageJson from '../../package.json';
import { Navbar } from 'react-bulma-components';
import { useState } from 'react';
import { PATHS } from '../utils';

const { Brand, Item, Burger, Container, Menu, Dropdown, Link } = Navbar;
const activeClassName = 'is-active';
const items = [
    {
        path: PATHS.ROUTERS.CONTACT,
        name: 'Kontakty',
        dividerAfter: false
    },
    {
        path: PATHS.ROUTERS.ABOUT,
        name: 'O nás',
        dividerAfter: true
    },
    {
        path: PATHS.ROUTERS.LOGIN,
        name: 'Přihlášení',
        dividerAfter: false
    },
    {
        path: PATHS.ROUTERS.REGISTRATION,
        name: 'Registrace',
        dividerAfter: false
    }
];

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

export default function NavbarComponent() {
    const [isBurgerActive, setBurgerActive] = useState(false);
    return (
        <Navbar color={'primary'} role="navigation" aria-label="main navigation" className='is-spaced has-shadow' >
            <Brand>
                <Item className='is-size-4 has-text-weight-bold' renderAs={RouterLink} to={PATHS.ROUTERS.HOME}>
                    {packageJson.app.name}
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
        </Navbar>
    )
}
