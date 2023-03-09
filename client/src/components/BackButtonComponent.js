import React from 'react';
import { Button, Container } from 'react-bulma-components';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function BackButtonComponent({ backNavigations }) {
    const { pathname } = useLocation();
    const backButtonPaths = [];
    const restaurantPath = pathname.split('/')[1];
    backButtonPaths.push(restaurantPath);

    return (
        backNavigations[backButtonPaths] &&
        <Container my={3} breakpoint={'fluid'} className='has-text-right'>
            <Button renderAs={Link} rounded color={'warning'} size={'large'} to={backNavigations[backButtonPaths]} preventScrollReset={true}><FontAwesomeIcon icon={faArrowLeft} /></Button>
        </Container>
    )
}
