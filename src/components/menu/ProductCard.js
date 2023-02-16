import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Content as TextContent, Heading, Columns, Button } from 'react-bulma-components';
import { useAddToCartItem } from '../../stores/ZustandStores';
import { IMAGE_BASE_URL, addSlashAfterUrl } from '../../utils';
const { Column } = Columns;
const { Image, Content } = Card;

export default function ProductCard({ product }) {
    const addToCartItem = useAddToCartItem();
    return (
        <Column narrow size="is-5-touch is-4-tablet is-3-desktop" className='is-one-quarter'>
            <Card key={product.ean}>
                <Image size="16by9" src={product.image ? product.image : addSlashAfterUrl(IMAGE_BASE_URL) + 'foods/food_default.png'} />
                <Content>
                    <TextContent>
                        <Columns className="is-mobile">
                            <Column color="primary" size="three-fifths">
                                <Heading subtitle size={7}>
                                    <Heading size={6}>{product.name}</Heading>
                                    {product.price} Kč
                                </Heading>
                            </Column>
                            <Column color="primary" size="two-fifths">
                                <Button color="white" onClick={() => addToCartItem(product, 1)}>
                                    <FontAwesomeIcon icon={faCartShopping} />
                                </Button>
                            </Column>
                        </Columns>
                    </TextContent>
                </Content>
            </Card>
        </Column>
    );
}
