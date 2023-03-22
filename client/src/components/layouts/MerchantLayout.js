import 'bulma/css/bulma.min.css';
import React, { Fragment, useLayoutEffect } from "react";
import { Outlet } from 'react-router-dom';
import FooterComponent from '../FooterComponent';
import { Container } from 'react-bulma-components';
import MerchantNavbar from '../merchant/MerchantNavbar';
import { CONFIG } from '../../config/config';

export default function MerchantLayout() {
    useLayoutEffect(() => {
        document.title = `Obchodník | ${CONFIG.APP_NAME}`
    }, []);

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
