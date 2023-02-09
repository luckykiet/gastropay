import React from 'react'
import { Content, Heading } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
export default function RestaurantPage() {
    const { idRestaurant } = useParams();
    console.log(idRestaurant);
    return (
        <>
            <Content className="has-text-centered">
                <Heading className="pt-5" spaced>Restaurace: {idRestaurant}</Heading>
            </Content>
        </>
    )
}
