import React, { Fragment } from 'react';
import { Button } from 'react-bulma-components';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function BackButtonComponent({ backNavigations }) {
    const { pathname } = useLocation();
    const backButtonPaths = [];
    const restaurantPath = pathname.split('/')[1];
    backButtonPaths.push(restaurantPath);

    return (
        <Fragment>
            {backNavigations[backButtonPaths] ?
                <Button id='fixedBackButton' renderAs={Link} rounded color={'warning'} size={'medium'} className='is-responsive' to={backNavigations[backButtonPaths]} preventScrollReset={true}><FontAwesomeIcon icon={faArrowLeft} /></Button>
                : undefined}
        </Fragment>
    )
}
