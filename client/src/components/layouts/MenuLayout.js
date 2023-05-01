import 'bulma/css/bulma.min.css';
import 'animate.css';
import React, { Fragment, useState, useLayoutEffect, useEffect } from "react";
import FooterComponent from '../FooterComponent';
import { Container } from 'react-bulma-components';
import BackButtonComponent from '../BackButtonComponent';
import MenuNavbar from '../menu/MenuNavbar';
import CollapsibleSidebar from '../menu/CollapsibleSidebar';
import MenuPage from '../../pages/guest/MenuPage';
import { useChosenRestaurant } from '../../stores/ZustandStores';
import { CONFIG } from '../../config/config';

export default function MenuLayout() {
    const restaurant = useChosenRestaurant();
    const [isSidebarShowed, setIsSidebarShowed] = useState(false);

    const showSidebar = () => {
        setIsSidebarShowed(!isSidebarShowed);
    }

    const handleCloseSidebar = () => {
        setIsSidebarShowed(false);
    }

    useEffect(() => {
        document.title = `${CONFIG.APP_NAME}`
    }, [])

    useLayoutEffect(() => {
        const html = document.documentElement;
        if (isSidebarShowed) {
            html.style.overflow = "hidden";
        } else {
            html.style.overflow = "unset";
        }

        return () => {
            html.style.overflow = "unset";
        };
    }, [isSidebarShowed]);

    return (
        <Fragment>
            <header>
                <MenuNavbar showSidebar={showSidebar} />
            </header>
            <main>
                <Container id='mainContainer' breakpoint={'fluid'}>
                    <CollapsibleSidebar handleCloseSidebar={handleCloseSidebar} show={isSidebarShowed} />
                    <BackButtonComponent backNavigations={{ "menu": "/restaurant/" + restaurant?._id }} />
                    <MenuPage />
                </Container>
            </main>
            <div style={{
                display: isSidebarShowed ? "block" : "none",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 100
            }} onClick={handleCloseSidebar} />
            <FooterComponent />
        </Fragment>
    )
}
