import React, { useState } from 'react';
import { Card, Heading, Columns, Button } from 'react-bulma-components';
import { useAddToCartItem } from '../../stores/ZustandStores';
import FoodNotification from './FoodNotification';
import { addSlashAfterUrl, isValidImageUrl } from '../../utils';
import { CONFIG } from '../../config/config';
const { Column } = Columns;
const { Content, Footer } = Card;

export default function ProductCard({ product }) {
    const addToCartItem = useAddToCartItem();
    const [notifications, setNotifications] = useState([]);

    const handleAddToCartClick = (product) => {
        addToCartItem(product, 1);
        const newNotification = `Přidáno ${product.name} do košíku!`;
        setNotifications([newNotification]);
    };

    return (
        <Column narrow className='is-one-quarter'>
            <Card key={product.ean}>
                <div className='card-image' alt={product.name} style={{
                    backgroundImage: `url(${isValidImageUrl(product.image)
                        ? product.image
                        : addSlashAfterUrl(CONFIG.IMAGE_BASE_URL) + 'foods/food_default.png'})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    height: "300px",
                    backgroundPosition: "center",
                    borderBottomStyle: "solid",
                    borderWidth: "1px",
                    borderColor: "hsl(0, 0%, 86%)"
                }} />
                <Content>
                    <Heading renderAs='p' className='is-size-5 is-size-2-mobile'>{product.name}</Heading>
                    <Heading renderAs='p' className='is-size-7 is-size-5-mobile is-italic'>{product.description}</Heading>
                    {product.allergens.length > 0 && <Heading renderAs='p' className='is-size-6 is-size-5-mobile'>Alergeny: {product.allergens.join(", ")}</Heading>}
                </Content>
                <Footer>
                    <Footer.Item>
                        <Button fullwidth color="white" size={"large"} className='has-text-weight-bold' onClick={() => handleAddToCartClick(product)}>
                            {product.price} Kč
                        </Button>
                    </Footer.Item>
                </Footer>
            </Card>
            {notifications.map((notification, index) => (
                <FoodNotification
                    key={index}
                    msg={notification}
                    color={'is-success'}
                />
            ))}
        </Column>
    );
}
