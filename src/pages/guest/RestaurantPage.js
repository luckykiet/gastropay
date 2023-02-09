import React from 'react'
import { Content, Heading } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
export default function RestaurantPage() {
    const { idRestaurant } = useParams();
    console.log(idRestaurant);
    return (
        <>
            <Content textAlign={'center'}>
                <Heading pt={5} spaced>Restaurace: {idRestaurant}</Heading>
            </Content>
        </>
    )
}
