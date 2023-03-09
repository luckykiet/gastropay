import React from 'react';
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Heading, Columns, Button } from 'react-bulma-components';
import { useAddToCartItem } from '../../stores/ZustandStores';
import { addSlashAfterUrl, isValidImageUrl } from '../../utils';
import { CONFIG } from '../../config/config'
import FoodNotification from './FoodNotification';
const { Column } = Columns;
const { Image, Content, Footer } = Card;

export default function ProductCard({ product, showNotification }) {
    const addToCartItem = useAddToCartItem();
    const handleAddToCartClick = (product) => {
        addToCartItem(product, 1);
        showNotification(product.name, "success");
    };
    return (
        <Column narrow className='is-one-quarter'>
            <Card key={product.ean}>
                <Image size="3by2" src={isValidImageUrl(product.image) ? product.image : addSlashAfterUrl(CONFIG.IMAGE_BASE_URL) + 'foods/food_default.png'} />
                <Content>
                    <Heading renderAs='p' className='is-size-5 is-size-2-mobile'>{product.name}</Heading>
                    <Heading renderAs='p' className='is-size-6 is-size-4-mobile'>{product.price} Kč</Heading>
                </Content>
                <Footer>
                    <Footer.Item>
                        <Button fullwidth className='is-size-1-mobile' color="white" size={"large"} onClick={() => handleAddToCartClick(product)}>
                            <FontAwesomeIcon icon={faCartShopping} />
                        </Button>
                    </Footer.Item>
                </Footer>
            </Card>
            <FoodNotification />
        </Column>
    );
}
