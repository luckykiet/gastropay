import 'bulma/css/bulma.min.css';
import { Outlet } from 'react-router-dom';
import FooterComponent from '../FooterComponent';
import NavbarComponent from '../NavbarComponent';
import { Container } from 'react-bulma-components';
export default function RootLayout() {
    return (
        <>
            <header>
                <NavbarComponent />
            </header>
            <main>
                <Container breakpoint={'fluid'}>
                    <Outlet />
                </Container>
            </main>
            <FooterComponent />
        </>
    )
}
