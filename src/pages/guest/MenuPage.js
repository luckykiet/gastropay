import React, { Fragment, useEffect, useState } from 'react';
import { Card, Container, Heading } from 'react-bulma-components';
import TabsList from '../../components/menu/TabsList';
import { createAxios, PATHS, addSlashAfterUrl } from '../../utils';
import { Link, useNavigate } from 'react-router-dom';
import LoadingComponent from '../../components/LoadingComponent';
import { Promise } from 'bluebird';
import { useChoosenRestaurant, useSetCartItems, useSetChoosenRestaurant } from '../../stores/ZustandStores';

const { Content } = Card;

export default function MenuPage() {
    const [restaurant, setRestaurant] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const setCart = useSetCartItems();
    const navigate = useNavigate();
    const apiUrl = addSlashAfterUrl(restaurant?.api?.baseUrl);
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (Object.keys(restaurant).length === 0) {
            setRestaurant({});
            setCart([]);
            navigate(PATHS.RESTAURANTS);
        } else {
            const axios = createAxios(apiUrl);
            Promise.delay(500)
                .then(() => axios.get(restaurant.api.params))
                .then((resp) => {
                    if (!resp.data.success) {
                        throw new Error('No data');
                    }

                    const tabs = [];
                    resp.data.msg.categories.forEach((tab, index) => {
                        tabs.push({
                            id: (index + 1),
                            name: tab.name,
                        });
                    });

                    const newMenu = [];

                    Object.keys(resp.data.msg.menu).forEach((ean) => {
                        newMenu.push({
                            ean,
                            ...resp.data.msg.menu[ean],
                        });
                    });

                    setMenu({
                        tabs,
                        menu: newMenu,
                    });
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        }
    }, [apiUrl, navigate, restaurant, setCart, setRestaurant]);

    return (
        <Fragment>

            {loading ? (
                <LoadingComponent />
            ) : (
                <Fragment>
                    <Content textAlign={"center"}>
                        <Heading pt={5} spaced>
                            {restaurant.name} - Menu
                        </Heading>
                    </Content>
                    <Container>
                        {Object.keys(menu).length === 0 ?
                            (
                                <Content textAlign={"center"}>
                                    <Heading pt={5} spaced>
                                        Výskytla se chyba
                                    </Heading>
                                    <p>
                                        Vraťte se na <Link to={PATHS.RESTAURANTS}>výběr restaurací.</Link>
                                    </p>
                                </Content>
                            ) :
                            (<TabsList listOfTabs={menu.tabs} content={menu.menu} />)
                        }
                    </Container>
                </Fragment>
            )}
        </Fragment>
    );
};