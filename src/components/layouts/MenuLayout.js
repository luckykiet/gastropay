import 'bulma/css/bulma.min.css';
import React, { Fragment } from "react";
import FooterComponent from '../FooterComponent';
import { Container } from 'react-bulma-components';
import BackButtonComponent from '../BackButtonComponent';
import MenuNavbar from '../menu/MenuNavbar';
import CollapsibleSidebar from '../menu/CollapsibleSidebar';
import MenuPage from '../../pages/guest/MenuPage';

export default function MenuLayout() {
    return (
        <Fragment>
            <header>
                <MenuNavbar />
            </header>
            <main>
                <Container id='mainContainer' breakpoint={'fluid'}>
                    <CollapsibleSidebar />
                    <BackButtonComponent />
                    <MenuPage />
                </Container>
            </main>
            <FooterComponent />
        </Fragment>
    )
}
