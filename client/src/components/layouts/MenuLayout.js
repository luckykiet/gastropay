import 'bulma/css/bulma.min.css';
import React, { Fragment, useState } from "react";
import FooterComponent from '../FooterComponent';
import { Container } from 'react-bulma-components';
import BackButtonComponent from '../BackButtonComponent';
import MenuNavbar from '../menu/MenuNavbar';
import CollapsibleSidebar from '../menu/CollapsibleSidebar';
import MenuPage from '../../pages/guest/MenuPage';
import { useChoosenRestaurant } from '../../stores/ZustandStores';

export default function MenuLayout() {
    const restaurant = useChoosenRestaurant();
    const [isSidebarShowed, setIsSidebarShowed] = useState(false);

    const showSidebar = () => {
        setIsSidebarShowed(!isSidebarShowed);
    }

    const handleCloseSidebar = () => {
        setIsSidebarShowed(false);
    }

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
            <FooterComponent />
        </Fragment>
    )
}
