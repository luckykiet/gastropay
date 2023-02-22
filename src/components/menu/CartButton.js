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
        <Button className="is-size-4 is-size-3-mobile" color={'primary'} size={"medium"} onClick={handleSetIsSidebarShowed}>
            <FontAwesomeIcon icon={faCartShopping} />
            {numItems > 0 && <span className='has-text-weight-bold'>&nbsp;{numItems}x</span>}
        </Button>
    );
};

export default CartButton;