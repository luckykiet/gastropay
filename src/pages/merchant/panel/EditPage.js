import React, { Fragment, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, API_URL, PATHS } from '../../../utils';
import { Promise } from 'bluebird';
import { Hero, Container, Heading } from 'react-bulma-components';
const { Body } = Hero;

export default function EditPage() {
    const idRestaurant = useParams().idRestaurant;
    const [restaurant, setRestaurant] = useState({});

    useEffect(() => {
        const fetchRestaurant = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.RESTAURANT}/${idRestaurant}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (success) {
                    setRestaurant(msg);
                }
            } catch (err) {
                console.log(err)
            }
        }
        Promise.delay(0).then(fetchRestaurant);
    }, [idRestaurant])

    return (
        <Fragment>
            <Hero color="link" size="small">
                <Body>
                    <Heading size={4}>{restaurant.name}</Heading>
                </Body>
            </Hero>
            <Container breakpoint={'fluid'}>
                <p>{restaurant.name}</p>
            </Container>
        </Fragment>
    )
}
