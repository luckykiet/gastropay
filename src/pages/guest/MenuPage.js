import React, { Fragment, useEffect, useState } from 'react';
import { Card, Container, Heading } from 'react-bulma-components';
import TabsList from '../../components/menu/TabsList';
import { createAxios, addSlashAfterUrl, PATHS } from '../../utils';
import { Link, useNavigate } from 'react-router-dom';
import { Promise } from 'bluebird';
import { useChoosenRestaurant, useSetTables } from '../../stores/ZustandStores';
import ProgressBar from '../../components/ProgressBar';

const { Content } = Card;

export default function MenuPage() {
    const restaurant = useChoosenRestaurant();
    const setTables = useSetTables();
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);
    const apiUrl = addSlashAfterUrl(restaurant?.api?.baseUrl);
    const navigate = useNavigate();

    useEffect(() => {
        if (Object.keys(restaurant).length === 0) {
            navigate(PATHS.ROUTERS.RESTAURANTS);
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
                    setTables(msg.tables);
                    setMenu({ tabs, menu: newMenu });
                } catch (err) {
                    console.log(err);
                } finally {
                    setLoading(false);
                }
            };
            Promise.delay(500).then(fetchData);
        }
    }, [navigate, restaurant, apiUrl, setTables]);

    return (
        <Fragment>
            {loading ? (
                <ProgressBar />
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
                                    Restaurace nevložila menu. Vraťte se na <Link to={PATHS.ROUTERS.RESTAURANTS}>výběr restaurací.</Link>
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
