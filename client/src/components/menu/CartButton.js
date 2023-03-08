import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bulma-components';
import 'bulma/';

export default function CartButton({ numItems, showSidebar }) {
    return (
        <Button className="is-size-5 is-size-3-mobile" color={'primary'} onClick={showSidebar}>
            <FontAwesomeIcon size='2x' icon={faCartShopping} />
            {numItems > 0 && <span className='has-text-weight-bold'>&nbsp;{numItems}x</span>}
        </Button>
    );
};