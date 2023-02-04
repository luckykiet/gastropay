import 'bulma/css/bulma.min.css';


const items = [
    {
        path: '/contact',
        name: 'Kontakty',
        dividerAfter: false
    },
    {
        path: '/about',
        name: 'O nás',
        dividerAfter: true
    },
    {
        path: '/login',
        name: 'Přihlášení',
        dividerAfter: true
    }
];

const NavItems = () => {
    return items.map(({ path, name, dividerAfter }) => (
        <>
            <a className='navbar-item' href={path} >{name}</a>
            {dividerAfter ? <hr className="navbar-divider" /> : ''}
        </>
    ));
}

const Navbar = () => {
    const activeClassName = "underline";
    return (
        <nav className='navbar is-primary' role="navigation" aria-label="main navigation" >
            <div className="navbar-brand">
                <a className="navbar-item" href="/">
                    Gastro Pay
                </a>
            </div>

            <div id="navbarMain" class="navbar-menu">
                <div className="navbar-item has-dropdown is-hoverable">
                    <a className="navbar-link">
                        Více
                    </a>
                    <div className="navbar-dropdown is-boxed">
                        <NavItems />
                    </div>
                </div>
            </div>

        </nav >
    )
}

export default Navbar
