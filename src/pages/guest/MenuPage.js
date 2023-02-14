import React, { useState } from 'react';
import { Card, Container, Content, Heading, Columns, Tabs } from 'react-bulma-components';
import { useAddToCartItem, useCartItems } from '../../stores/ZustandStores';
import { calculateTotalCartPrice } from '../../utils';

const tabs = [
    { ean: 1, name: 'Bun' },
    { ean: 2, name: 'Pho' }
];

const products = [
    { ean: 1, group: 1, name: 'Bun bo nam bo', image: 'https://ms2.ostium.cz/instance/web-recepty/jINtNvoq/h397w674t.jpg', price: 119 },
    { ean: 2, group: 1, name: 'Bun cha gio', image: 'https://thevietvegan.com/wp-content/uploads/2020/09/IMG_0886W-480x480.jpg', price: 114 },
    { ean: 3, group: 1, name: 'Bun nem nuong', image: 'https://theravenouscouple.com/wp-content/uploads/2009/05/bunnemnuong.jpg', price: 119 },
    { ean: 4, group: 2, name: 'Pho bo', image: 'http://www.sushitime.cz/image-cache/1280x1280/_files_products_727-pho-bo-A.jpg', price: 139 },
    { ean: 5, group: 2, name: 'Pho ga', image: 'https://www.hungrywanderlust.com/wp-content/uploads/2020/01/Chicken-Pho-Recipe_0206-1024x683.jpg', price: 139 },
];

const ProductCard = ({ product }) => {
    const addToCartItem = useAddToCartItem();

    return (
        <Columns.Column className='is-one-third'>
            <Card onClick={() => addToCartItem(product, 1)}>
                <Card.Image size={'4by3'} src={product.image} />
                <Card.Content>
                    <Content>
                        <Heading size={5}>{product.name}</Heading>
                        <Heading subtitle size={6}>
                            {product.price} Kč
                        </Heading>
                    </Content>
                </Card.Content>
            </Card>
        </Columns.Column>
    );
};


const ProductList = ({ groupId, content }) => {
    const groupedProducts = content.filter((product) => product.group === groupId);
    return (
        <React.Fragment>
            {groupedProducts.map((product) => (
                <ProductCard key={product.ean} product={product} />
            ))}
        </React.Fragment>
    );
};

const Cart = () => {
    const cartItems = useCartItems();
    return (
        <React.Fragment>
            <Heading size={4}>Cart</Heading>
            <ul>
                {cartItems.map((item) => (
                    <li key={item.id}>
                        {item.name} x {item.quantity} = {item.quantity * parseFloat(item.price)} Kč
                    </li>
                ))}
                <li>Total price: {calculateTotalCartPrice(cartItems)}</li>
            </ul>
        </React.Fragment>
    );
};

const TabsPage = ({ listOfTabs, content }) => {
    const [activeTab, setActiveTab] = useState(listOfTabs.length > 0 ? listOfTabs[0].ean : 0);
    const handleTabClick = (index) => {
        setActiveTab(index);
    };

    return (
        <React.Fragment>
            <Tabs align={'center'} size={'large'}>
                {listOfTabs.map((tab) => (
                    <Tabs.Tab key={tab.ean} active={activeTab === tab.ean} onClick={() => handleTabClick(tab.ean)}>
                        {tab.name}
                    </Tabs.Tab>
                ))}
            </Tabs>
            <Columns centered vCentered>
                {listOfTabs.map((tab) => (
                    activeTab === tab.ean && <ProductList key={tab.ean} groupId={tab.ean} content={content} />
                ))}
            </Columns>
        </React.Fragment>
    );
};

export default function MenuPage() {

    return (
        <React.Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>
                    Menu
                </Heading>
            </Content>
            <Container>
                <TabsPage listOfTabs={tabs} content={products} />
            </Container>
            <Cart />
        </React.Fragment>
    );
};