import React from "react";
import "../../assets/scss/CollapsibleSidebar.scss";
import { Button, Card, Heading } from "react-bulma-components";
import { useCartItems, useTips } from "../../stores/ZustandStores";
import Cart from "./Cart";
import { calculateCart, PATHS } from '../../utils';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faWallet } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const { Header, Content, Footer } = Card;
const { Title, Icon } = Header;
const { Item } = Footer;
export default function CollapsibleSidebar({ show, handleCloseSidebar }) {
    const cartItems = useCartItems();
    const tips = useTips();
    const navigate = useNavigate();

    const handleCheckOutClick = () => {
        if (Object.keys(cartItems).length > 0) {
            navigate(PATHS.ROUTERS.PAYMENT);
        }
    }
    return (
        <div className={`collapsible-sidebar ${!show ? "is-hidden" : ""} has-background-grey-light`}>
            <Card mx={3} mt={3}>
                <Header>
                    <Title>
                        <Heading size={3}>Košík &nbsp;<FontAwesomeIcon icon={faCartShopping} /></Heading>
                    </Title>
                    <Icon>
                        <Button size={"large"} onClick={handleCloseSidebar} remove />
                    </Icon>
                </Header>
                <Content>
                    <Cart />
                </Content>
                <Footer>
                    <Item>
                        <Heading size={4} renderAs="p">Celkem: {Math.round(calculateCart(cartItems).totalPrice + tips) + " Kč"}</Heading>
                    </Item>
                    <Item>
                        <Button onClick={handleCheckOutClick} disabled={Object.keys(cartItems).length === 0 ? true : false} className="has-text-weight-bold" color={"success"}><FontAwesomeIcon icon={faWallet} />&nbsp;Přejít k platbě</Button>
                    </Item>
                </Footer>
            </Card>
        </div>
    );
};

