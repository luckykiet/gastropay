import React, { useEffect, useState } from 'react';
import { Columns, Content, Heading, Image } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, paths, BASE_URL, isOpening, daysOfWeeksCzech, MAX_OPENING_TIME_OBJECT_LENGTH } from "../../utils";
import Promise from "bluebird";
import moment from 'moment';

export default function RestaurantPage() {
    const [business, setBusiness] = useState({});
    const { idRestaurant } = useParams();
    const IMAGE_BASE_URL = "http://localhost:3000";
    const todayDay = moment().day();
    const currentOpeningTimeStyle = (time) => {
        return Object.keys(time).length < MAX_OPENING_TIME_OBJECT_LENGTH || !isOpening(time.from, time.to)
            ? "has-text-weight-bold has-text-danger"
            : "has-text-weight-bold has-text-success";
    };
    useEffect(() => {
        const axios = createAxios(BASE_URL);
        Promise.delay(0)
            .then(async () => {
                const resp = await axios.get(`/database/restaurant/${idRestaurant}.json`);
                if (!resp.data) {
                    throw new Error('No data');
                }
                setBusiness(resp.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [idRestaurant]);

    if (Object.keys(business).length === 0) {
        return (
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>
                    Výskytla se chyba
                </Heading>
                <p>
                    Vraťte se na<Link to={paths.RESTAURANTS}>výběr restaurací.</Link>
                </p>
            </Content>
        );
    }

    return (
        <React.Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>
                    {business.name}
                </Heading>
            </Content>
            <Columns>
                <Columns.Column>
                    <Image
                        size={"3by2"}
                        alt={business.name}
                        src={business.image ? IMAGE_BASE_URL + business.image : BASE_URL + "/images/restaurants/default.jpg"}
                    ></Image>
                </Columns.Column>
                <Columns.Column>
                    <Content>
                        <p className="has-text-weight-bold is-size-4">Otevírací doba:</p>
                        <ul>
                            {Object.keys(daysOfWeeksCzech).map((item, index) => (
                                <li className={index === todayDay ? currentOpeningTimeStyle(business.openingTime?.[item] ?? {}) : undefined} key={item}>
                                    <span className="alignAfterColon">{daysOfWeeksCzech[item].name}:</span>
                                    {business.openingTime?.[item] ? (
                                        <span>{business.openingTime[item].from + " - " + business.openingTime[item].to}</span>
                                    ) : (
                                        <span>Zavřeno</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Content>
                </Columns.Column>
            </Columns>
        </React.Fragment>
    );
}
