import 'bulma/css/bulma.min.css';
import React, { Fragment } from "react";
import { Outlet } from 'react-router-dom';
import FooterComponent from '../FooterComponent';
import NavbarComponent from '../NavbarComponent';
import { Container } from 'react-bulma-components';
import BackButtonComponent from '../BackButtonComponent';
export default function MenuLayout() {
    return (
        <Fragment>
            <header>
                <NavbarComponent />
            </header>
            <main>
                <Container id='mainContainer' breakpoint={'fluid'}>
                    <BackButtonComponent />
                    <Outlet />
                </Container>
            </main>
            <FooterComponent />
        </Fragment>
    )
}
