import { useEffect, useState } from "react";
import { Button, Card, Container, Content, Heading, Section } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { createAxios, paths } from "../../utils";
import { Promise } from "bluebird";
export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState([]);
    const navigate = useNavigate();

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
        }).catch((error) => {
            navigate(paths.ERROR);
            console.log(error);
        });
    }, [navigate]);

    return (
        <>
            <Content className="has-text-centered">
                <Heading className="pt-5" spaced>Zvolte restauraci</Heading>
            </Content>
            <Section>
                <Container>
                    {Object.keys(restaurants).map((item, i) => {
                        return (
                            <Card key={item}>
                                <Card.Header>
                                    <Card.Header.Title>{restaurants[item].name}</Card.Header.Title>
                                </Card.Header>
                                <Card.Content>
                                    <Content>
                                        <p>{restaurants[item].address.street}</p>
                                        <p>{restaurants[item].address.postalCode} {restaurants[item].address.city}</p>
                                    </Content>
                                </Card.Content>
                                <Card.Footer>
                                    <Card.Footer.Item><Button onClick={() => navigate(paths.RESTAURANT + "/" + item)} color={"primary"} fullwidth>Zvolit</Button></Card.Footer.Item>
                                </Card.Footer>
                            </Card>
                        )
                    })}
                </Container>
            </Section>
        </>
    );
}                                                       