import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bulma-components';
import 'bulma/';
import { useIsSidebarShowed, useSetIsSidebarShowed } from "../../stores/ZustandStores";

const CartButton = ({ numItems }) => {
    const [isSidebarShowed, setIsSidebarShowed] = [useIsSidebarShowed(), useSetIsSidebarShowed()];
    const handleSetIsSidebarShowed = () => {
        setIsSidebarShowed(!isSidebarShowed);
    }
    return (
        <Button color={'primary'} onClick={handleSetIsSidebarShowed}>
            <FontAwesomeIcon icon={faCartShopping} size='lg' />
            {numItems > 0 && <span>&nbsp;{numItems} x</span>}
        </Button>
    );
};

export default CartButton;