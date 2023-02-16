import React, { Fragment, useEffect, useState } from 'react';
import { Card, Container, Heading } from 'react-bulma-components';
import TabsList from '../../components/menu/TabsList';
import { createAxios, BASE_URL, PATHS } from '../../utils';
import { useParams, Link } from 'react-router-dom';
import LoadingComponent from '../../components/LoadingComponent';
import { Promise } from 'bluebird';

const { Content } = Card;

export default function MenuPage() {
    const { idRestaurant } = useParams();
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const axios = createAxios(BASE_URL);
        Promise.delay(500).then(() => {
            return axios.get(`/api/restaurant/${idRestaurant}.json`);
        }).then((resp) => {
            if (!resp.data.success) {
                throw new Error('No data')
            }
            const tabs = [];
            resp.data.msg.categories.forEach((tab, index) => {
                tabs.push({
                    "id": (index + 1),
                    "name": tab.name
                })
            });

            const newMenu = [];

            Object.keys(resp.data.msg.menu).forEach((ean) => {
                newMenu.push({
                    "ean": ean,
                    ...resp.data.msg.menu[ean]
                })
            });

            setMenu({
                "tabs": tabs,
                "menu": newMenu
            });
            setLoading(false);
        }).catch((err) => {
            console.log(err);
        });
    }, [idRestaurant]);

    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>
                    Menu
                </Heading>
            </Content>
            {loading ? (
                <LoadingComponent />
            ) : (
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
            )}
        </Fragment>
    );
};