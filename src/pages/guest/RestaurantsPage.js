import { useEffect, useState } from "react";
import { Button, Card, Container, Content, Heading, Media, Image, Columns } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { BASE_URL, createAxios, paths } from "../../utils";
import { Promise } from "bluebird";
import moment from "moment";

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

    const RestaurantLists = () => {
        if (!restaurants || Object.keys(restaurants).length === 0) {
            return (
                <Content textAlign={"center"}>
                    <p>Momentálně není žádná restaurace aktivní</p>
                </Content>
            )
        } else {
            return (
                Object.keys(restaurants).map((item) => {
                    return (
                        <Columns.Column key={item} narrow>
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
                                                    <dt>{OpeningTime(restaurants[item].openingTime.wednesday.from, restaurants[item].openingTime.wednesday.to)}</dt>
                                                </dl>
                                            </Content>
                                        </Media.Item>
                                    </Media>
                                </Card.Content>
                                <Card.Footer>
                                    <Card.Footer.Item><Button onClick={() => navigate(paths.RESTAURANT + "/" + item)} color={"primary"} fullwidth>Zvolit</Button></Card.Footer.Item>
                                </Card.Footer>
                            </Card>
                        </Columns.Column>
                    )
                })
            )
        }
    }

    const OpeningTime = (beginTime, endTime) => {
        const formattedBeginTime = moment(beginTime, 'HH:mm');
        const formattedEndTime = moment(endTime, 'HH:mm');
        const currentTime = moment();
        if (currentTime.isBefore(formattedEndTime)) {
            return <p><strong className="has-text-success">Otevřeno</strong> &#x2022; Zavírá v {formattedEndTime.format('HH:mm')}</p>
        } else {
            return <p><strong className="has-text-danger">Zavřeno</strong> &#x2022; Otevírá v {formattedBeginTime.format('HH:mm')}</p>
        }
    }

    return (
        <>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Zvolte restauraci</Heading>
            </Content>

            <Container>
                <Columns centered vCentered>
                    <RestaurantLists />
                </Columns>

            </Container>

        </>
    );
}                                                       