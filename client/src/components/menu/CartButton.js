import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Icon } from 'react-bulma-components';
import 'bulma/';

export default function CartButton({ numItems, showSidebar }) {
    return (
        <Button size={'large'} color={'primary'} onClick={showSidebar}>
            <Icon mx={3} size={'large'}>
                <FontAwesomeIcon icon={faCartShopping} />
                {numItems > 0 && <span className='has-text-weight-bold'>&nbsp;{numItems}x</span>}
            </Icon>
        </Button>
    );
};