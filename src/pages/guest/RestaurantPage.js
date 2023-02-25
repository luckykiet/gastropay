import React, { Fragment, useEffect, useState } from 'react';
import { Block, Button, Columns, Container, Content, Heading, Image } from 'react-bulma-components';
import { Link, useParams } from 'react-router-dom';
import { createAxios, API_URL, isOpening, daysOfWeeksCzech, IMAGE_BASE_URL, addSlashAfterUrl, BASE_URL, removeSlashFromUrl } from "../../utils";
import Promise from "bluebird";
import moment from 'moment';
import LoadingComponent from '../../components/LoadingComponent';
import { useChoosenRestaurant, useSetChoosenRestaurant } from '../../stores/ZustandStores';
import DownloadableQRCode from '../../components/restaurants/DownloadableQRCode';
import { PATHS } from '../../utils';

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
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.RESTAURANT}/${idRestaurant}`);
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
                                    Vraťte se na <Link to={PATHS.ROUTERS.RESTAURANTS}>výběr restaurací.</Link>
                                </p>
                            </Content>
                        ) :
                        (
                            <Fragment>
                                <Columns>
                                    <Column size={"is-half"}>
                                        <Container className='has-text-left'>
                                            <Image
                                                size={"3by2"}
                                                alt={business.name}
                                                src={business.image ? addSlashAfterUrl(IMAGE_BASE_URL) + business.image : addSlashAfterUrl(IMAGE_BASE_URL) + "/restaurants/default.jpg"}
                                            />
                                        </Container>
                                    </Column>
                                    <Column>
                                        <Content>
                                            <Heading renderAs='h3' className="has-text-weight-bold is-size-4">Otevírací doba:</Heading>
                                            <ul className='is-size-5'>
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
                                    </Column>
                                    <Column size={"is-half"}>
                                        <Content size={'medium'}>
                                            <Heading renderAs='h3' className="has-text-weight-bold is-size-4">Adresa:</Heading>
                                            <span>{business.address.street}</span>
                                            <br />
                                            <span>{business.address.postalCode} {business.address.city}</span>
                                        </Content>
                                        <Block><DownloadableQRCode info={{ name: business.name, url: removeSlashFromUrl(BASE_URL) + PATHS.ROUTERS.RESTAURANT + "/" + business._id, size: 200 }} /></Block>
                                    </Column>
                                </Columns>
                                <Block pt={5}>
                                    <Container className='has-text-centered' >
                                        <Button className='has-text-weight-bold' rounded color={'success'} style={{ width: "300px" }} size={'large'} renderAs={Link} to={PATHS.ROUTERS.MENU}>Objednat jídlo</Button>
                                    </Container>
                                </Block>
                            </Fragment>
                        )}
                </Fragment>
            )}
        </Fragment>
    );
}
