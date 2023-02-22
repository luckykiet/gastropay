import React, { Fragment, useEffect, useState } from 'react';
import { Button, Columns, Content, Heading, Image } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, PATHS, API_URL, isOpening, daysOfWeeksCzech, IMAGE_BASE_URL, addSlashAfterUrl } from "../../utils";
import Promise from "bluebird";
import moment from 'moment';
import LoadingComponent from '../../components/LoadingComponent';
import { useChoosenRestaurant, useSetChoosenRestaurant } from '../../stores/ZustandStores';

const { Column } = Columns;

const currentOpeningTimeStyle = (day) => {
    return !day.isOpen || !isOpening(day.from, day.to)
        ? "has-text-weight-bold has-text-danger"
        : "has-text-weight-bold has-text-success";
};

export default function RestaurantPage() {
    const [business, setBusiness] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const [loading, setLoading] = useState(true);
    const { idRestaurant } = useParams();

    const todayDay = moment().day();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const { data: { success, msg } } = await axios.get(`api/restaurant/${idRestaurant}`);
                if (!success) {
                    throw new Error(msg);
                }
                const restaurant = msg;
                setBusiness(restaurant);
                setLoading(false);
            } catch (err) {
                setBusiness({});
                setLoading(false);
                console.log(err);
            }
        }
        Promise.delay(500).then(fetchData);
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
                                        src={business.image ? addSlashAfterUrl(IMAGE_BASE_URL) + business.image : addSlashAfterUrl(IMAGE_BASE_URL) + "/restaurants/default.jpg"}
                                    ></Image>
                                </Column>
                                <Column>
                                    <Content>
                                        <p className="has-text-weight-bold is-size-4">Otevírací doba:</p>
                                        <ul>
                                            {Object.keys(daysOfWeeksCzech).map((day, index) => (
                                                <li className={index === todayDay ? currentOpeningTimeStyle(business.openingTime[day]) : undefined} key={day}>
                                                    <span className="alignAfterColon">{daysOfWeeksCzech[day].name}:</span>
                                                    {business.openingTime[day].isOpen ? (
                                                        <span>{business.openingTime[day].from + " - " + business.openingTime[day].to}</span>
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
