import React, { Fragment, useEffect, useState } from "react";
import { Button, Card, Container, Content as TextContent, Heading, Media, Image, Columns } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { BASE_URL, createAxios, isOpening, PATHS, daysOfWeeksCzech } from "../../utils";
import { Promise } from "bluebird";
import moment from "moment";

const { Item } = Media;
const { Header, Content, Footer } = Card;
const { Column } = Columns;

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState([]);
    const navigate = useNavigate();
    const IMAGE_BASE_URL = "http://localhost:3000";

    //TODO get from db
    useEffect(() => {
        const axios = createAxios("http://localhost:3000/database");
        Promise.delay(0).then(() => {
            return axios.get('/restaurants.json');
        }).then((resp) => {
            if (!resp.data) {
                throw resp.data;
            }
            setRestaurants(resp.data);
        }).catch((err) => {
            console.log(err);
        });
    }, [navigate]);

    const OpeningTime = (todayOpeningTime, nextOpenTime) => {
        if (todayOpeningTime.today === "closed" && nextOpenTime === "closed") {
            return <p><strong className="has-text-danger">Dočasně uzavřeno</strong></p>;
        } else if (todayOpeningTime.today === "closed" && nextOpenTime !== "closed") {
            const day = Object.keys(nextOpenTime);
            return <p><strong className="has-text-danger">Zavřeno</strong>  &#x2022; Otevírá v {daysOfWeeksCzech[day]?.shortcut} {nextOpenTime[day]?.from}</p>;
        } else {
            const isOpeningNow = isOpening(todayOpeningTime.today.from, todayOpeningTime.today.to);
            if (isOpeningNow) {
                return <p><strong className="has-text-success">Otevřeno</strong> &#x2022; Zavírá v {todayOpeningTime.today.to}</p>
            } else {
                if (moment().isBefore(moment(todayOpeningTime.today.from, "HH:mm"))) {
                    const beginTime = todayOpeningTime.today.from;
                    return <p><strong className="has-text-danger">Zavřeno</strong>  &#x2022; Otevírá v {beginTime}</p>;
                } else {
                    const day = Object.keys(nextOpenTime);
                    const beginTime = nextOpenTime[day]?.from;
                    return <p><strong className="has-text-danger">Zavřeno</strong>  &#x2022; Otevírá v {daysOfWeeksCzech[day].shortcut} {beginTime}</p>;
                }
            }
        }
    }

    return (
        <Fragment>
            <TextContent textAlign={"center"}>
                <Heading pt={5} spaced>Zvolte restauraci</Heading>
            </TextContent>
            <Container>
                <Columns centered vCentered>
                    {(!restaurants || Object.keys(restaurants).length === 0) ?
                        <TextContent textAlign={"center"}>
                            <p>Momentálně není žádná restaurace aktivní</p>
                        </TextContent>
                        :
                        Object.keys(restaurants).map((item) => {
                            return (
                                <Column key={restaurants[item]._id} narrow>
                                    <Card>
                                        <Header>
                                            <Header.Title>{restaurants[item].name}</Header.Title>
                                        </Header>
                                        <Content>
                                            <Media>
                                                <Item align="left">
                                                    <Image alt={restaurants[item].name} src={restaurants[item].image ? IMAGE_BASE_URL + restaurants[item].image : BASE_URL + "/images/restaurants/default.jpg"} size={128}></Image>
                                                </Item>
                                                <Item align="center">
                                                    <TextContent>
                                                        <dl>
                                                            <dt><strong>Adresa:</strong></dt>
                                                            <dd>{restaurants[item].address.street}</dd>
                                                            <dd>{restaurants[item].address.postalCode} {restaurants[item].address.city}</dd>
                                                        </dl>
                                                        <dl>
                                                            <dt>{OpeningTime(restaurants[item].openingTime, restaurants[item].nextOpeningTime)}</dt>
                                                        </dl>
                                                    </TextContent>
                                                </Item>
                                            </Media>
                                        </Content>
                                        <Footer>
                                            <Footer.Item><Button onClick={() => navigate(PATHS.RESTAURANT + "/" + restaurants[item]._id)} color={"primary"} fullwidth>Zvolit</Button></Footer.Item>
                                        </Footer>
                                    </Card>
                                </Column>
                            )
                        })
                    }
                </Columns>
            </Container>
        </Fragment>
    );
}