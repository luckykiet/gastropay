import { Link } from 'react-router-dom';
import packageJson from '../../package.json';

const items = [
    {
        path: 'contact',
        name: 'Kontakty',
        dividerAfter: false
    },
    {
        path: 'about',
        name: 'O nás',
        dividerAfter: true
    },
    {
        path: 'login',
        name: 'Přihlášení',
        dividerAfter: false
    }
];

const NavItems = () => {
    return items.map(({ path, name, dividerAfter }) => (
        <>
            <Link className='navbar-item' to={path} >{name}</Link>
            {dividerAfter ? <hr className="navbar-divider" /> : ''}
        </>
    ));
}

const Navbar = () => {
    // const activeClassName = "underline";
    return (
        <nav className='navbar is-primary is-spaced has-shadow' role="navigation" aria-label="main navigation" >
            <div className="navbar-brand">
                <Link className="navbar-item" to="/">
                    {packageJson.app.name}
                </Link>
            </div>

            <div id="navbarMain" className="navbar-menu">
                <div className="navbar-item has-dropdown is-hoverable">
                    <Link to="/" className="navbar-link">
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
