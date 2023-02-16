import React from "react";
import "../../assets/scss/CollapsibleSidebar.scss";
import { Button, Card, Heading } from "react-bulma-components";
import { useIsSidebarShowed, useSetIsSidebarShowed } from "../../stores/ZustandStores";
import Cart from "./Cart";
const CollapsibleSidebar = () => {
    const [isSidebarShowed, setIsSidebarShowed] = [useIsSidebarShowed(), useSetIsSidebarShowed()];
    const handleCloseSidebar = () => {
        setIsSidebarShowed(!isSidebarShowed);
    }
    return (
        <div className={`collapsible-sidebar ${!isSidebarShowed ? "is-hidden" : ""}`}>
            <Card>
                <Card.Header>
                    <Card.Header.Title>
                        <Heading size={3}>Košík</Heading>
                    </Card.Header.Title>
                    <Card.Header.Icon>
                        <Button size={"large"} onClick={handleCloseSidebar} remove />
                    </Card.Header.Icon>
                </Card.Header>
                <Card.Content>
                    <Cart />
                </Card.Content>
                <Card.Footer>
                    <Card.Footer.Item>
                        <Button color={"success"}>Checkout</Button>
                    </Card.Footer.Item>
                </Card.Footer>
            </Card>
        </div>
    );
};

export default CollapsibleSidebar;