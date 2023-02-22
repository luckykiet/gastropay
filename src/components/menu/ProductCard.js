import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Content as TextContent, Heading, Columns, Button, Container } from 'react-bulma-components';
import { useAddToCartItem } from '../../stores/ZustandStores';
import { IMAGE_BASE_URL, addSlashAfterUrl } from '../../utils';
import FoodNotification from './FoodNotification';
const { Column } = Columns;
const { Image, Content } = Card;

export default function ProductCard({ product, showNotification }) {
    const addToCartItem = useAddToCartItem();
    const handleAddToCartClick = (product) => {
        addToCartItem(product, 1);
        showNotification(product.name, "success");
    };
    return (
        <Column narrow size="is-5-touch is-4-tablet is-3-desktop" className='is-one-quarter'>
            <Card key={product.ean}>
                <Image size="16by9" src={product.image ? product.image : addSlashAfterUrl(IMAGE_BASE_URL) + 'foods/food_default.png'} />
                <Content>
                    <Columns className="is-mobile">
                        <Column color="primary" size="three-fifths">
                            <Container className='has-text-left'>
                                <TextContent>
                                    <Heading renderAs='h3' className='is-size-2-mobile' size={5}>{product.name}</Heading>
                                    <Heading renderAs='h4' className='is-size-4-mobile' size={6}>{product.price} Kč</Heading>
                                </TextContent>
                            </Container>
                        </Column>
                        <Column color="primary" size="two-fifths">
                            <Container className='has-text-centered'>
                                <Button className='is-size-1-mobile' color="white" size={"large"} onClick={() => handleAddToCartClick(product)}>
                                    <FontAwesomeIcon icon={faCartShopping} />
                                </Button>
                            </Container>
                        </Column>
                    </Columns>
                </Content>
            </Card>
            <FoodNotification />
        </Column>
    );
}
