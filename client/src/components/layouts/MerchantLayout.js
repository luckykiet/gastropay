import 'bulma/css/bulma.min.css';
import React, { Fragment } from "react";
import { Outlet } from 'react-router-dom';
import FooterComponent from '../FooterComponent';
import { Container } from 'react-bulma-components';
import MerchantNavbar from '../merchant/MerchantNavbar';

export default function MerchantLayout() {
    return (
        <Fragment>
            <header>
                <MerchantNavbar />
            </header>
            <main>
                <Container id='mainContainer' breakpoint={'fluid'}>
                    <Outlet />
                </Container>
            </main>
            <FooterComponent />
        </Fragment>
    )
}
