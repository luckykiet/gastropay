import { Link, NavLink, useLocation } from 'react-router-dom';
import packageJson from '../../package.json';
import { paths } from '../utils';
import { Button, Navbar } from 'react-bulma-components';
import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const activeClassName = 'is-active';
const backNavigations = {
    'restaurant': '/restaurants',
};
const items = [
    {
        path: paths.CONTACT,
        name: 'Kontakty',
        dividerAfter: false
    },
    {
        path: paths.ABOUT,
        name: 'O nás',
        dividerAfter: true
    },
    {
        path: paths.LOGIN,
        name: 'Přihlášení',
        dividerAfter: false
    },
    {
        path: paths.REGISTRATION,
        name: 'Registrace',
        dividerAfter: false
    }
];

const NavItems = () => {

    return items.map(({ path, name, dividerAfter }, index) => (
        <div key={index}>
            <NavLink className={({ isActive }) =>
                "navbar-item " + (isActive ? activeClassName : undefined)
            } to={path} >{name}</NavLink>
            {dividerAfter ? <Navbar.Divider /> : ''}
        </div>
    ));
}

export default function NavbarComponent() {
    const { pathname } = useLocation();

    const backButtonPaths = [];
    const restaurantPath = pathname.split('/')[1];
    backButtonPaths.push(restaurantPath);

    const [isBurgerActive, setBurgerActive] = useState(false);
    return (
        <Navbar color={'primary'} role="navigation" aria-label="main navigation" className='is-spaced has-shadow' >
            <Navbar.Brand>
                <Navbar.Item renderAs={Link} to={paths.HOME}>
                    {packageJson.app.name}
                </Navbar.Item>
                <Navbar.Burger aria-label="menu" aria-expanded="false" data-target="navbarMain" onClick={() => {
                    setBurgerActive(!isBurgerActive);
                }} className={
                    isBurgerActive ? activeClassName : undefined
                } />
            </Navbar.Brand>
            <Navbar.Menu id='navbarMain' className={
                isBurgerActive ? activeClassName : undefined
            }>
                <Navbar.Container align='left'>
                    <Navbar.Item hoverable>
                        <Navbar.Link>Více</Navbar.Link>
                        <Navbar.Dropdown boxed>
                            <NavItems />
                        </Navbar.Dropdown>
                    </Navbar.Item>
                </Navbar.Container>
            </Navbar.Menu>
            {backNavigations[backButtonPaths] ?
                <Navbar.Container align='right'>
                    <Button renderAs={Link} rounded color={'warning'} to={backNavigations[backButtonPaths]}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                </Navbar.Container>
                : undefined}
        </Navbar>
    )
}
