import React from 'react';
import { Columns, Card, Media, Image, Content as TextContent, Button } from 'react-bulma-components';
import { IMAGE_BASE_URL, addSlashAfterUrl, isValidUrl } from "../../utils";
import OpeningTimeStatus from "../../components/restaurants/OpeningTimeStatus";
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../utils';

export default function RestaurantCard({ restaurant }) {
    const { Item } = Media;
    const { Header, Content, Footer } = Card;
    const { Title } = Header;
    const { Column } = Columns;
    const navigate = useNavigate();

    return (
        <Column narrow>
            <Card>
                <Header>
                    <Title>{restaurant.name}</Title>
                </Header>
                <Content>
                    <Media>
                        <Item align="left">
                            <Image
                                alt={restaurant.name}
                                src={
                                    restaurant.image
                                        ? isValidUrl(restaurant.image) ? restaurant.image : addSlashAfterUrl(IMAGE_BASE_URL) + restaurant.image
                                        : addSlashAfterUrl(IMAGE_BASE_URL) + '/restaurants/default.jpg'
                                }
                                size={128}
                            />
                        </Item>
                        <Item align="center">
                            <TextContent>
                                <dl>
                                    <dt>
                                        <strong>Adresa:</strong>
                                    </dt>
                                    <dd>{restaurant.address.street}</dd>
                                    <dd>
                                        {restaurant.address.postalCode} {restaurant.address.city}
                                    </dd>
                                </dl>
                                <dl>
                                    <dt>
                                        <OpeningTimeStatus todayOpeningTime={restaurant.openingTime} nextOpenTime={restaurant.nextOpenTime} />
                                    </dt>
                                </dl>
                            </TextContent>
                        </Item>
                    </Media>
                </Content>
                <Footer>
                    <Footer.Item>
                        <Button rounded size={"medium"} className='has-text-weight-bold' onClick={() => navigate(PATHS.ROUTERS.RESTAURANT + '/' + restaurant._id)} color={'primary'} fullwidth>
                            Zvolit
                        </Button>
                    </Footer.Item>
                </Footer>
            </Card>
        </Column>
    );
}
