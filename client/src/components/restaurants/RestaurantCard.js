import React from 'react';
import { Columns, Card, Media, Content as TextContent, Button, Block } from 'react-bulma-components';
import { addSlashAfterUrl, isValidImageUrl } from "../../utils";
import OpeningTimeStatus from "../../components/restaurants/OpeningTimeStatus";
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../config/paths';
import { CONFIG } from '../../config/config';

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
                        <figure className="image is-128x128 is-fullwidth mr-3">
                            <img style={{ height: "100%" }} alt={restaurant.name}
                                src={
                                    isValidImageUrl(restaurant.image)
                                        ? restaurant.image
                                        : addSlashAfterUrl(CONFIG.IMAGE_BASE_URL) + 'restaurants/default.jpg'
                                } />
                        </figure>
                        <Item align="center">
                            <TextContent>
                                <dl>
                                    <dt>
                                        <strong>Adresa:</strong>
                                    </dt>
                                    <dt>{restaurant.address.street}</dt>
                                    <dt>
                                        {restaurant.address.postalCode} {restaurant.address.city}
                                    </dt>
                                </dl>
                            </TextContent>
                        </Item>
                    </Media>
                    <Block className='has-text-centered'>
                        <OpeningTimeStatus todayOpeningTime={restaurant.openingTime} nextOpenTime={restaurant.nextOpenTime} />
                    </Block>
                </Content>
                <Footer>
                    <Footer.Item>
                        <Button rounded size={"medium"} className='has-text-weight-bold' onClick={() => navigate(PATHS.RESTAURANT + '/' + restaurant._id)} color={'primary'} fullwidth>
                            Zvolit
                        </Button>
                    </Footer.Item>
                </Footer>
            </Card>
        </Column>
    );
}
