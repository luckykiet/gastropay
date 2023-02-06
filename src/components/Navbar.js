import { Link, NavLink } from 'react-router-dom';
import packageJson from '../../package.json';
import { paths } from '../utils';

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
    return items.map(({ path, name, dividerAfter }) => (
        <>
            <NavLink className={({ isActive }) =>
                'navbar-item' + (isActive ? activeClassName : "")} to={path} >{name}</NavLink>
            {dividerAfter ? <hr className="navbar-divider" /> : ''}
        </>
    ));
}

const Navbar = () => {
    return (
        <nav className='navbar is-primary is-spaced has-shadow' role="navigation" aria-label="main navigation" >
            <div className="navbar-brand">
                <Link className="navbar-item" to={paths.HOME}>
                    {packageJson.app.name}
                </Link>
            </div>

            <div id="navbarMain" className="navbar-menu">
                <div className="navbar-item has-dropdown is-hoverable">
                    <Link to={paths.HOME} className="navbar-link">
                        Více
                    </Link>
                    <div className="navbar-dropdown is-boxed">
                        <NavItems />
                    </div>
                </div>
            </div>

        </nav >
    )
}

export default Navbar
