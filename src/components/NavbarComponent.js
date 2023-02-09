import { Link, NavLink } from 'react-router-dom';
import packageJson from '../../package.json';
import { paths } from '../utils';
import { Navbar } from 'react-bulma-components';

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
    let activeClassName = ' is-active';
    return items.map(({ path, name, dividerAfter }, index) => (
        <>
            <NavLink key={index} className={({ isActive }) =>
                'navbar-item' + (isActive ? activeClassName : "")} to={path} >{name}</NavLink>
            {dividerAfter ? <Navbar.Divider /> : ''}
        </>
    ));
}

export default function NavbarComponent() {
    return (
        <Navbar color={'primary'} className='is-spaced has-shadow' >
            <Navbar.Brand>
                <Link className="navbar-item" to={paths.HOME}>
                    {packageJson.app.name}
                </Link>
            </Navbar.Brand>
            <Navbar.Container>
                <Navbar.Item hoverable>
                    <Navbar.Link>Více</Navbar.Link>
                    <Navbar.Dropdown boxed>
                        <NavItems />
                    </Navbar.Dropdown>
                </Navbar.Item>
            </Navbar.Container>
        </Navbar>
    )
}
