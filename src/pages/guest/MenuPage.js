import React, { Fragment, useEffect, useState } from 'react';
import { Card, Container, Heading } from 'react-bulma-components';
import TabsList from '../../components/menu/TabsList';
import { createAxios, addSlashAfterUrl } from '../../utils';
import { Link, useNavigate } from 'react-router-dom';
import LoadingComponent from '../../components/LoadingComponent';
import { Promise } from 'bluebird';
import { useChoosenRestaurant, useSetCartItems, useSetChoosenRestaurant } from '../../stores/ZustandStores';
import config from '../../config/config';

const { Content } = Card;

export default function MenuPage() {
    const [restaurant, setRestaurant] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const setCart = useSetCartItems();
    const navigate = useNavigate();
    const apiUrl = addSlashAfterUrl(restaurant?.api?.baseUrl);
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        return () => {
            setRestaurant({});
            setCart([]);
        };
    }, [navigate, setCart, setRestaurant]);


    useEffect(() => {
        if (Object.keys(restaurant).length === 0) {
            navigate(config.PATHS.ROUTERS.RESTAURANTS);
        } else {
            const fetchData = async () => {
                try {
                    const axios = createAxios(apiUrl);
                    const { data: { success, msg } } = await axios.get(restaurant.api.params);
                    if (!success) {
                        throw new Error(msg);
                    }
                    const tabs = msg.categories.map((tab, index) => ({
                        id: index + 1,
                        name: tab.name,
                    }));
                    const newMenu = Object.entries(msg.menu).map(([ean, item]) => ({ ean, ...item }));
                    setMenu({ tabs, menu: newMenu });
                } catch (error) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            };
            Promise.delay(500).then(fetchData);
        }
    }, [navigate, restaurant, apiUrl]);

    return (
        <Fragment>
            {loading ? (
                <LoadingComponent />
            ) : (
                <Fragment>
                    <Content textAlign="center">
                        <Heading pt={5} spaced>
                            {restaurant.name} - Menu
                        </Heading>
                    </Content>
                    <Container>
                        {Object.keys(menu).length === 0 ? (
                            <Content textAlign="center">
                                <Heading pt={5} spaced>
                                    Výskytla se chyba
                                </Heading>
                                <p>
                                    Vraťte se na <Link to={config.PATHS.ROUTERS.RESTAURANTS}>výběr restaurací.</Link>
                                </p>
                            </Content>
                        ) : (
                            <TabsList listOfTabs={menu.tabs} content={menu.menu} />
                        )}
                    </Container>
                </Fragment>
            )}
        </Fragment>
    );
}
