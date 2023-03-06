import React, { useState, useEffect } from 'react';
import { createAxios, addSlashAfterUrl, API_URL, getItemsFromToken, PATHS } from '../../utils';
import { Promise } from 'bluebird';
import { Columns, Heading, Hero, Button } from 'react-bulma-components';
import RestaurantCard from '../../components/merchant/RestaurantCard';
import { Link, Outlet } from 'react-router-dom';
import { useChoosenRestaurant } from '../../stores/MerchantStores';

const { Column } = Columns;
const { Body } = Hero;
export default function DashboardPage() {
    const userId = getItemsFromToken().userId;
    const [restaurants, setRestaurants] = useState([]);
    const choosenRestaurant = useChoosenRestaurant();

    useEffect(() => {
        const fetchRestaurants = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}s`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (!success) {
                    throw new Error(msg);
                }
                setRestaurants(msg)
            } catch (err) {
                console.log(err)
            }
        }
        Promise.delay(0).then(fetchRestaurants);
    }, [userId, choosenRestaurant])

    return (
        <Columns centered>
            <Column className='is-one-thirds-desktop'>
                <Hero color="info" size="small">
                    <Body>
                        <Heading size={4} className='is-inline-block'>Restaurace</Heading>
                        <Button color={'warning'} size={'medium'} className='is-pulled-right' renderAs={Link} to={PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.RESTAURANT_ADD}>Přidat</Button>
                    </Body>
                </Hero>
                <Column>
                    {restaurants.length === 0 ?
                        <Heading size={5} renderAs='p'>Nemáte ještě žádnou restauraci.</Heading>
                        :
                        restaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                        ))
                    }
                </Column>
            </Column>
            <Column className='is-two-thirds-desktop'>
                <Outlet />
            </Column>
        </Columns>
    )
}
