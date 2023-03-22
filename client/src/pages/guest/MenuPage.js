import React, { Fragment, useEffect, useState, useLayoutEffect } from 'react';
import { Card, Container, Heading } from 'react-bulma-components';
import TabsList from '../../components/menu/TabsList';
import { createAxios, addSlashAfterUrl } from '../../utils';
import { Link, useNavigate } from 'react-router-dom';
import { Promise } from 'bluebird';
import { useChosenRestaurant, useSetTables } from '../../stores/ZustandStores';
import ProgressBar from '../../components/ProgressBar';
import { PATHS } from '../../config/paths';
import { CONFIG } from '../../config/config';
import { API } from '../../config/api';
import { nanoid } from 'nanoid';

const { Content } = Card;

export default function MenuPage() {
    const restaurant = useChosenRestaurant();
    const setTables = useSetTables();
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        document.title = `Menu | ${CONFIG.APP_NAME}`;
    }, [])

    useEffect(() => {
        if (Object.keys(restaurant).length === 0) {
            navigate(PATHS.RESTAURANTS);
        } else {
            document.title = `Menu - ${restaurant.name} | ${CONFIG.APP_NAME}`;
            setLoading(true);
            const axios = createAxios(addSlashAfterUrl(`${CONFIG.API_URL}/${API.PROXY}`));
            Promise.delay(0).then(() => {
                return axios.get(`get?url=${restaurant.api.menuUrl}${restaurant.api.key}`);
            }).then((resp) => {
                const { data: { success, msg } } = resp;
                if (!success) {
                    throw new Error(msg);
                }
                const groups = msg.sections;
                const products = msg.articles;
                const tabs = [];
                const newMenu = [];
                groups.forEach(({ name, items }) => {
                    const tabId = nanoid();
                    tabs.push({
                        id: tabId,
                        name,
                    });

                    items.forEach((item) => {
                        const product = products[item.ean];
                        if (product) {
                            newMenu.push({
                                name: product.name,
                                price: product.price,
                                tab: tabId,
                                ean: item.ean,
                                image: item.image,
                            });
                        }
                    });
                });

                const tables = [];
                if (msg.tables) {
                    msg.tables.map((table) => (
                        tables.push({
                            id: table._id,
                            name: table.table_name
                        })
                    ))
                }
                setTables(tables);
                setMenu({ tabs, menu: newMenu });
            }).catch((error) => {
                setMenu({});
                console.log(error);
            }).finally(() => {
                setLoading(false);
            })
        }
    }, [navigate, restaurant, setTables]);

    return (
        <Fragment>
            {loading ? (
                <ProgressBar />
            ) : (
                <Fragment>
                    <Content textAlign="center">
                        <Heading>
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
                                    Restaurace nevložila menu. Vraťte se na <Link to={PATHS.RESTAURANTS}>výběr restaurací.</Link>
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
