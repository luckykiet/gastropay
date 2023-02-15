import React from 'react'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Content as TextContent, Heading, Columns, Button } from 'react-bulma-components';
import { useAddToCartItem } from '../../stores/ZustandStores';

const { Column } = Columns;
const { Image, Content } = Card;

export default function ProductCard({ product }) {
    const addToCartItem = useAddToCartItem();
    return (
        <Column className='is-one-quarter'>
            <Card key={product.ean}>
                <Image size={'4by3'} src={product.image} />
                <Content>
                    <TextContent>
                        <Columns>
                            <Column size={'four-fifths'}>
                                <Heading size={5}>{product.name}</Heading>
                                <Heading subtitle size={6}>
                                    {product.price} Kč
                                </Heading>
                            </Column>
                            <Column size={'one-fifths'}>
                                <Button color={'white'} onClick={() => addToCartItem(product, 1)} ><FontAwesomeIcon icon={faCartShopping} /></Button>
                            </Column>
                        </Columns>
                    </TextContent>
                </Content>
            </Card>
        </Column>
    );
}