import React, { Fragment, useEffect, useState } from 'react';
import { Button, Columns, Content, Heading, Image } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, PATHS, BASE_URL, isOpening, daysOfWeeksCzech, MAX_OPENING_TIME_OBJECT_LENGTH, IMAGE_BASE_URL, addSlashAfterUrl } from "../../utils";
import Promise from "bluebird";
import moment from 'moment';
import LoadingComponent from '../../components/LoadingComponent';
import { useChoosenRestaurant, useSetChoosenRestaurant } from '../../stores/ZustandStores';

const { Column } = Columns;

const currentOpeningTimeStyle = (time) => {
    return Object.keys(time).length < MAX_OPENING_TIME_OBJECT_LENGTH || !isOpening(time.from, time.to)
        ? "has-text-weight-bold has-text-danger"
        : "has-text-weight-bold has-text-success";
};

export default function RestaurantPage() {
    const [business, setBusiness] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const [loading, setLoading] = useState(true);
    const { idRestaurant } = useParams();

    const todayDay = moment().day();

    useEffect(() => {
        const axios = createAxios(addSlashAfterUrl(BASE_URL));
        Promise.delay(500).then(() => {
            // TODO json for each restaurant
            return axios.get(`database/restaurant/${idRestaurant}.json`);
        }).then((resp) => {
            if (!resp.data) {
                throw new Error('No data')
            }
            setBusiness(resp.data);
            setLoading(false);
        }).catch((err) => {
            setBusiness({});
            setLoading(false);
            console.log(err);
        });
    }, [idRestaurant, setBusiness]);


    return (
        <Fragment>
            {loading ? (
                <LoadingComponent />
            ) : (
                <Fragment>
                    <Content textAlign={"center"}>
                        <Heading pt={5} spaced>
                            {business.name}
                        </Heading>
                    </Content>
                    {Object.keys(business).length === 0 ?
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
                        (
                            <Columns>
                                <Column>
                                    <Image
                                        size={"3by2"}
                                        alt={business.name}
                                        src={business.image ? addSlashAfterUrl(business.image.baseUrl) + business.image.params : addSlashAfterUrl(IMAGE_BASE_URL) + "/restaurants/default.jpg"}
                                    ></Image>
                                </Column>
                                <Column>
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
                                    <Button color={'success'} fullwidth size={'medium'} renderAs={Link} to={PATHS.MENU}>Objednat jídlo</Button>
                                </Column>
                            </Columns>
                        )}
                </Fragment>
            )}
        </Fragment>
    );
}
