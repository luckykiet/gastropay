import 'bulma/css/bulma.min.css';
import React, { Fragment, useLayoutEffect } from "react";
import { Outlet } from 'react-router-dom';
import FooterComponent from '../FooterComponent';
import NavbarComponent from '../NavbarComponent';
import { Container } from 'react-bulma-components';
import BackButtonComponent from '../BackButtonComponent';
import { CONFIG } from '../../config/config';

export default function RootLayout() {
    useLayoutEffect(() => {
        document.title = `${CONFIG.APP_NAME}`
    }, []);

    return (
        <Fragment>
            <header>
                <NavbarComponent />
            </header>
            <main>
                <Container id='mainContainer' breakpoint={'fluid'}>
                    <BackButtonComponent backNavigations={{ 'restaurant': '/restaurants' }} />
                    <Outlet />
                </Container>
            </main>
            <FooterComponent />
        </Fragment>
    )
}
