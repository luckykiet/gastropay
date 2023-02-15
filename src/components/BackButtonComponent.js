import React, { Fragment } from 'react';
import { Button } from 'react-bulma-components';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
const backNavigations = {
    'restaurant': '/restaurants',
};
export default function BackButtonComponent() {
    const { pathname } = useLocation();

    const backButtonPaths = [];
    const restaurantPath = pathname.split('/')[1];
    backButtonPaths.push(restaurantPath);
    return (
        <Fragment>
            {backNavigations[backButtonPaths] ?
                <Button id='fixedBackButton' renderAs={Link} rounded color={'warning'} size={'medium'} className='is-responsive' to={backNavigations[backButtonPaths]}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                : undefined}
        </Fragment>
    )
}
