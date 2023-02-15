import React, { Fragment } from 'react';
import { Card, Container, Heading } from 'react-bulma-components';
import TabsList from '../../components/menu/TabsList';

const { Content } = Card;
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

export default function MenuPage() {

    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>
                    Menu
                </Heading>
            </Content>
            <Container>
                <TabsList listOfTabs={tabs} content={products} />
            </Container>
        </Fragment>
    );
};