import React, { useState, useEffect, Fragment } from 'react';
import { createAxios, addSlashAfterUrl, getItemsFromToken } from '../../utils';
import { Promise } from 'bluebird';
import { Columns, Heading, Hero, Button, Tabs } from 'react-bulma-components';
import RestaurantCard from '../../components/merchant/RestaurantCard';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useChoosenRestaurant, useSetChoosenRestaurant } from '../../stores/MerchantStores';
import ConfirmBox from '../../components/merchant/ConfirmBox';
import { PATHS } from '../../config/paths';
import { API } from '../../config/api';
import { CONFIG } from '../../config/config';

const { Column } = Columns;
const { Body } = Hero;
const { Tab } = Tabs;

export default function DashboardPage() {
    const userId = getItemsFromToken().userId;
    const [restaurants, setRestaurants] = useState([]);
    const [showConfirmBox, setShowConfirmBox] = useState(false);
    const { idRestaurant } = useParams();
    const [choosenRestaurant, setChoosenRestaurant] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const location = useLocation();
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRestaurants = async () => {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`${API.MERCHANT}/${API.RESTAURANT}s`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (!success) {
                    throw new Error(msg);
                }
                setRestaurants(msg);
            } catch (err) {
                console.log(err)
            }
        }
        Promise.delay(0).then(fetchRestaurants);
    }, [userId, choosenRestaurant, navigate]);

    useEffect(() => {
        if (location.pathname === PATHS.MERCHANT) {
            setChoosenRestaurant({});
        }
    }, [location.pathname, setChoosenRestaurant])

    const handleDeleteButtonClick = (e) => {
        e.preventDefault();
        setShowConfirmBox(true);
    };

    const handleConfirm = async () => {
        try {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            const { data: { success, msg } } = await axios.delete(
                `${API.MERCHANT}/${API.RESTAURANT}/${idRestaurant}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('token')
                }
            });

            if (!success) {
                throw new Error(msg);
            }
            navigate(PATHS.MERCHANT);
        } catch (err) {
            console.log(err)
        } finally {
            setShowConfirmBox(false);
        }
    };

    return (
        <Columns centered>
            <Column className='is-one-thirds-desktop'>
                <Hero color="info" size="small">
                    <Body>
                        <Heading size={4} className='is-inline-block'>Restaurace</Heading>
                        <Button color={'warning'} size={'medium'} className='is-pulled-right' renderAs={Link} to={PATHS.MERCHANT + '/' + PATHS.RESTAURANT_ADD}>P??idat</Button>
                    </Body>
                </Hero>
                <Column>
                    {restaurants.length === 0 ?
                        <Heading size={5} renderAs='p'>Nem??te je??t?? ????dnou restauraci.</Heading>
                        :
                        restaurants.map((restaurant) => (
                            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                        ))
                    }
                </Column>
            </Column>
            <Column className='is-two-thirds-desktop'>
                {location.pathname !== PATHS.MERCHANT &&
                    <Fragment>
                        {location.pathname !== PATHS.MERCHANT + '/' + PATHS.RESTAURANT_ADD &&
                            <Fragment>
                                {showConfirmBox && (
                                    <ConfirmBox
                                        message={'Chcete smazat ' + choosenRestaurant.name + '?'}
                                        yesText={"Smazat"}
                                        noText={"Zru??it"}
                                        title={"Smazat restauraci"}
                                        onConfirm={handleConfirm}
                                        onCancel={() => setShowConfirmBox(false)}
                                    />
                                )}
                                <Hero color="link" size="small">
                                    <Body>
                                        <Heading size={4} className='is-inline-block'>{choosenRestaurant.name}</Heading>
                                        <Button color={'danger'} size={'medium'} className='is-pulled-right' onClick={handleDeleteButtonClick}>Smazat</Button>
                                    </Body>
                                </Hero>
                                <Tabs size={"large"} align="center">
                                    <Tab active={location.pathname === PATHS.MERCHANT + "/" + PATHS.RESTAURANT_EDIT + "/" + idRestaurant} renderAs={Link} to={PATHS.MERCHANT + "/" + PATHS.RESTAURANT_EDIT + "/" + idRestaurant}>Edit</Tab>
                                    <Tab active={location.pathname === PATHS.MERCHANT + "/" + PATHS.RESTAURANT_TRANSACTION + "/" + idRestaurant} renderAs={Link} to={PATHS.MERCHANT + "/" + PATHS.RESTAURANT_TRANSACTION + "/" + idRestaurant}>Transakce</Tab>
                                </Tabs>
                            </Fragment>
                        }
                        <Outlet />
                    </Fragment>
                }
            </Column>
        </Columns>
    )
}
