import React, { Fragment, useEffect, useState } from 'react';
import { Block, Button, Columns, Container, Content, Heading, Image } from 'react-bulma-components';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createAxios, isOpening, daysOfWeeksCzech, addSlashAfterUrl, removeSlashFromUrl, daysOfWeeks, isValidImageUrl } from "../../utils";
import Promise from "bluebird";
import moment from 'moment';
import LoadingComponent from '../../components/LoadingComponent';
import { useChoosenRestaurant, useSetCartItems, useSetChoosenRestaurant } from '../../stores/ZustandStores';
import DownloadableQRCode from '../../components/restaurants/DownloadableQRCode';
import { PATHS } from '../../config/paths';
import { API } from '../../config/api';
import { CONFIG } from '../../config/config';

const { Column } = Columns;

const currentOpeningTimeStyle = (day) => {
    return !day.isOpen || !isOpening(day.from, day.to)
        ? "has-text-weight-bold has-text-danger"
        : "has-text-weight-bold has-text-success";
};

export default function RestaurantPage() {
    const [business, setBusiness] = useState({});
    const [choosenRestaurant, setChoosenRestaurant] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const [loading, setLoading] = useState(true);
    const { idRestaurant } = useParams();
    const setCartItems = useSetCartItems();
    const todayDay = moment().day();
    const todayDayText = daysOfWeeks[todayDay];
    const navigate = useNavigate();

    const handleChooseClick = () => {
        if (choosenRestaurant && choosenRestaurant._id !== business._id) {
            setCartItems([]);
        }
        setChoosenRestaurant(business);
        navigate(PATHS.MENU);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const { data: { success, msg } } = await axios.get(`api/${API.RESTAURANT}/${idRestaurant}`);
                if (!success) {
                    throw new Error(msg);
                }
                setBusiness(msg);
            } catch (err) {
                setBusiness({});
                console.log(err);
            } finally {
                setLoading(false);
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
                            <Fragment>
                                <Columns>
                                    <Column size={"is-half"}>
                                        <Container className='has-text-left'>
                                            <Image
                                                size={"3by2"}
                                                alt={business.name}
                                                src={isValidImageUrl(business.image)
                                                    ? business.image
                                                    : addSlashAfterUrl(CONFIG.IMAGE_BASE_URL) + '/restaurants/default.jpg'}
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
                                        <Block><DownloadableQRCode info={{ name: business.name, url: removeSlashFromUrl(CONFIG.BASE_URL) + PATHS.RESTAURANT + "/" + business._id, size: 200 }} /></Block>
                                    </Column>
                                </Columns>
                                <Block pt={5}>
                                    <Container className='has-text-centered' >
                                        {!business.openingTime[todayDayText].isOpen || !isOpening(business.openingTime[todayDayText].from, business.openingTime[todayDayText].to) ?
                                            <Button className='has-text-weight-bold' rounded color={'danger'} style={{ width: "300px" }} size={'large'} disabled>Mimo otevírací doby</Button>
                                            :
                                            <Button className='has-text-weight-bold' rounded color={'success'} style={{ width: "300px" }} size={'large'} onClick={handleChooseClick}>Objednat jídlo</Button>
                                        }
                                    </Container>
                                </Block>
                            </Fragment>
                        )}
                </Fragment>
            )}
        </Fragment>
    );
}
