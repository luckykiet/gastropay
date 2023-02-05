import 'bulma/css/bulma.min.css';
import { Link } from 'react-router-dom';


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
        dividerAfter: true
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
        <nav className='navbar is-primary' role="navigation" aria-label="main navigation" >
            <div className="navbar-brand">
                <Link className="navbar-item" to="/">
                    Gastro Pay
                </Link>
            </div>

            <div id="navbarMain" class="navbar-menu">
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
