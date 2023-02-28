import React from 'react';
import { Columns, Card, Media, Content as TextContent, Heading } from 'react-bulma-components';
import { IMAGE_BASE_URL, addSlashAfterUrl, PATHS, isValidUrl } from "../../utils";
import { useNavigate } from 'react-router-dom';
import { useChoosenRestaurant, useSetChoosenRestaurant } from '../../stores/MerchantStores';
const { Item } = Media;
const { Header, Content, Footer } = Card;
const { Column } = Columns;

export default function RestaurantCard({ restaurant }) {
    const navigate = useNavigate();
    const [choosenRestaurant, setChoosenRestaurant] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const handleOnClick = () => {
        if (choosenRestaurant._id === restaurant._id) {
            setChoosenRestaurant({});
            navigate(PATHS.ROUTERS.MERCHANT);
        } else {
            setChoosenRestaurant(restaurant);
            navigate(PATHS.ROUTERS.MERCHANT + '/' + PATHS.ROUTERS.RESTAURANT_EDIT + '/' + restaurant._id)
        }
    }

    return (
        <Column fullwidth="true">
            <Card className={"is-clickable" + (choosenRestaurant._id === restaurant._id ? " has-background-light" : "")} onClick={handleOnClick}>
                <Header>
                    <Header.Title>{restaurant.name}</Header.Title>
                </Header>
                <Content>
                    <Media size={"4by3"}>
                        <Item align="left">
                            <figure className="image">
                                <img
                                    src={
                                        restaurant.image
                                            ? isValidUrl(restaurant.image) ? restaurant.image : addSlashAfterUrl(IMAGE_BASE_URL) + restaurant.image
                                            : addSlashAfterUrl(IMAGE_BASE_URL) + '/restaurants/default.jpg'
                                    }
                                    alt={restaurant.name}
                                    style={{ width: '70px', height: '70px' }}
                                />
                            </figure>
                        </Item>
                        <Item align="center">
                            <TextContent>
                                <Heading renderAs='span' className='has-text-weight-bold is-size-4 is-size-5-tablet is-size-5-mobile'>Adresa:</Heading>
                                <br />
                                <Heading className='is-size-4 is-size-6-tablet is-size-6-mobile has-text-weight-normal' renderAs='span'>{restaurant.address.street}</Heading>
                                <br />
                                <Heading className='is-size-4 is-size-6-tablet is-size-6-mobile has-text-weight-normal' renderAs='span'>{restaurant.address.postalCode} {restaurant.address.city}</Heading>
                            </TextContent>
                        </Item>
                    </Media>
                </Content>
                <Footer>
                    <Footer.Item>
                        {restaurant.isAvailable ? <Heading renderAs='span' className='has-text-success is-size-4 is-size-4-tablet is-size-5-mobile'>Aktivní</Heading> : <Heading renderAs='span' size={4} className='has-text-danger'>Neaktivní</Heading>}
                    </Footer.Item>
                </Footer>
            </Card>
        </Column>
    );
}
