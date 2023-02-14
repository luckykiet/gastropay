import React from "react";
import { useEffect, useState } from "react";
import { Button, Card, Container, Content, Heading, Media, Image, Columns } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { BASE_URL, MAX_OPENING_TIME_OBJECT_LENGTH, MIN_OPENING_TIME_OBJECT_ITEMS, createAxios, isOpening, paths } from "../../utils";
import { Promise } from "bluebird";
import moment from "moment";
import { daysOfWeeks, daysOfWeeksCzech } from "../../utils";

const today = moment().day();
const todaySring = daysOfWeeks[today];

const todayOpeningTime = (todaySring, openingTimes) => {
    if (openingTimes[todaySring]) {
        const result = {
            today: {
                from: openingTimes[todaySring].from,
                to: openingTimes[todaySring].to,
            }
        };
        return result;
    }
    return {
        today: "closed"
    };
};

const nextOpeningTime = (today, daysOfWeeks, openingTimes) => {
    const MAX_DAYS_OF_THE_WEEK = 6;
    let result = {
        "nextOpenTime": "closed"
    };
    if (Object.keys(openingTimes).length < MIN_OPENING_TIME_OBJECT_ITEMS) {
        return result;
    }

    let i = 0;
    if (today !== MAX_DAYS_OF_THE_WEEK) {
        i = today;
    }

    let count = Object.keys(daysOfWeeks).length;
    while (count > 0) {
        i++;
        const day = openingTimes[daysOfWeeks[i]];
        if (day && Object.keys(day).length === MAX_OPENING_TIME_OBJECT_LENGTH) {
            result = {
                "nextOpenTime": {
                    [daysOfWeeks[i]]: day
                }
            }
            break;
        }
        if (i === MAX_DAYS_OF_THE_WEEK) {
            i = 0;
        }
        count--;
    }
    return result;
};

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
            const newRestaurants = {};
            Object.keys(resp.data).forEach((res) => {
                newRestaurants[res] = { ...resp.data[res] };
                newRestaurants[res].openingTime = todayOpeningTime(todaySring, resp.data[res].openingTime);
                Object.assign(newRestaurants[res], nextOpeningTime(today, daysOfWeeks, resp.data[res].openingTime));
            });
            setRestaurants(newRestaurants);
        }).catch((err) => {
            console.log(err);
        });
    }, [navigate]);

    const OpeningTime = (beginTime, endTime, nextOpenTimeObj) => {
        const isOpeningNow = isOpening(beginTime, endTime);
        const formattedBeginTime = moment(beginTime, 'HH:mm');
        const formattedEndTime = moment(endTime, 'HH:mm');

        if (isOpeningNow) {
            return <p><strong className="has-text-success">Otevřeno</strong> &#x2022; Zavírá v {formattedEndTime.format('HH:mm')}</p>
        } else {
            const currentTime = moment();
            const day = Object.keys(nextOpenTimeObj)[0];
            const nextOpeningTime = currentTime.isBefore(formattedBeginTime) ? formattedBeginTime.format('HH:mm') : moment(nextOpenTimeObj[day].from, 'HH:mm').format('HH:mm');
            return <p><strong className="has-text-danger">Zavřeno</strong> &#x2022; Otevírá v {daysOfWeeksCzech[day].shortcut} {nextOpeningTime}</p>
        }

    }

    return (
        <React.Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Zvolte restauraci</Heading>
            </Content>
            <Container>
                <Columns centered vCentered>
                    {(!restaurants || Object.keys(restaurants).length === 0) ?
                        <Content textAlign={"center"}>
                            <p>Momentálně není žádná restaurace aktivní</p>
                        </Content>
                        :
                        Object.keys(restaurants).map((item) => {
                            return (
                                <Columns.Column key={restaurants[item]._id} narrow>
                                    <Card>
                                        <Card.Header>
                                            <Card.Header.Title>{restaurants[item].name}</Card.Header.Title>
                                        </Card.Header>
                                        <Card.Content>
                                            <Media>
                                                <Media.Item align="left">
                                                    <Image alt={restaurants[item].name} src={restaurants[item].image ? IMAGE_BASE_URL + restaurants[item].image : BASE_URL + "/images/restaurants/default.jpg"} size={128}></Image>
                                                </Media.Item>
                                                <Media.Item align="center">
                                                    <Content>
                                                        <dl>
                                                            <dt><strong>Adresa:</strong></dt>
                                                            <dd>{restaurants[item].address.street}</dd>
                                                            <dd>{restaurants[item].address.postalCode} {restaurants[item].address.city}</dd>
                                                        </dl>
                                                        <dl>
                                                            <dt>{OpeningTime(restaurants[item].openingTime.today.from, restaurants[item].openingTime.today.to, restaurants[item].nextOpenTime)}</dt>
                                                        </dl>
                                                    </Content>
                                                </Media.Item>
                                            </Media>
                                        </Card.Content>
                                        <Card.Footer>
                                            <Card.Footer.Item><Button onClick={() => navigate(paths.RESTAURANT + "/" + restaurants[item]._id)} color={"primary"} fullwidth>Zvolit</Button></Card.Footer.Item>
                                        </Card.Footer>
                                    </Card>
                                </Columns.Column>
                            )
                        })
                    }
                </Columns>
            </Container>
        </React.Fragment>
    );
}                                                       