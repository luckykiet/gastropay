import React, { Fragment, useState, useEffect } from 'react';
import { createAxios, addSlashAfterUrl, API_URL, PATHS } from '../../../utils';
import { Box, Heading, Form, Button, Container, Hero, Block } from "react-bulma-components";
import 'rc-time-picker/assets/index.css';
import "react-toggle/style.css";
import produce from 'immer';
import { useSetChoosenRestaurant } from '../../../stores/MerchantStores';
import { useNavigate } from 'react-router-dom';

const { Body } = Hero;
const { Field, Label, Control, Input, Help } = Form;
export default function AddPage() {
    const navigate = useNavigate();
    const [postMsg, setPostMsg] = useState({});
    const [restaurant, setRestaurant] = useState({
        name: "",
        address: {
            street: "",
            city: "",
            postalCode: ""
        }
    });
    const setChoosenRestaurant = useSetChoosenRestaurant();

    useEffect(() => {
        setChoosenRestaurant({});
    }, [setChoosenRestaurant])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRestaurant(
            produce((draft) => {
                const keys = name.split(".");
                const lastKey = keys.pop();
                let parent = draft;
                keys.forEach((key) => {
                    parent = parent[key];
                });
                parent[lastKey] = value;
            })
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPostMsg({});
        if (restaurant.name === '' || restaurant.address.street === '' || restaurant.address.city === '' || restaurant.address.postalCode === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const modifiedData = {
                    ...restaurant,
                }

                const { data: { success, msg } } = await axios.post(
                    `api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}`,
                    JSON.stringify(modifiedData), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });

                if (success) {
                    setChoosenRestaurant(msg);
                    navigate(PATHS.ROUTERS.MERCHANT + "/" + PATHS.ROUTERS.RESTAURANT_EDIT + "/" + msg._id)
                } else {
                    setPostMsg({
                        success: false,
                        msg: msg
                    });
                }
            } catch (err) {
                console.log(err.response.data.msg)
                setPostMsg({
                    success: false,
                    msg: err.response.data.msg
                });
            }
        }
    }
    return (
        <Fragment><Hero color="success" size="small">
            <Body>
                <Heading size={4}>Přidat novou restauraci</Heading>
            </Body>
        </Hero>
            <Container py={5} breakpoint={'fluid'} style={{ height: "calc(60vh)", overflowY: 'scroll' }}>
                <Box style={{ margin: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        <Block>
                            <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>Profile:</Heading>
                            <Field>
                                <Label htmlFor="inputName">
                                    Název
                                </Label>
                                <Control>
                                    <Input onChange={handleChange} name={"name"} value={restaurant?.name} type={"text"} id="inputName" placeholder="Gastro bistro" />
                                </Control>
                                {postMsg && typeof postMsg.msg === "object" && postMsg.msg.name && <Help color={'danger'}>{postMsg.msg.name}</Help>}
                            </Field>
                        </Block>
                        <Block>
                            <Heading renderAs='p' size={4} className='has-text-weight-bold'>Adresa:</Heading>
                            <Field>
                                <Label htmlFor="inputStreet">
                                    Ulice
                                </Label>
                                <Control>
                                    <Input onChange={handleChange} name={"address.street"} value={restaurant.address?.street} type={"text"} id="inputStreet" placeholder="Na Porici 81" />
                                </Control>
                                {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.street'] && <Help color={'danger'}>{postMsg.msg['address.street']}</Help>}
                            </Field>
                            <Field>
                                <Label htmlFor="inputCity">
                                    Město
                                </Label>
                                <Control>
                                    <Input onChange={handleChange} name={"address.city"} value={restaurant.address?.city} type={"text"} id="inputCity" placeholder="Praha 1" />
                                </Control>
                                {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.city'] && <Help color={'danger'}>{postMsg.msg['address.city']}</Help>}
                            </Field>
                            <Field>
                                <Label htmlFor="inputPsc">
                                    PSČ
                                </Label>
                                <Control>
                                    <Input onChange={handleChange} name={"address.postalCode"} value={restaurant.address?.postalCode} type={"text"} id="inputPsc" placeholder="11000" />
                                </Control>
                            </Field>
                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.postalCode'] && <Help color={'danger'}>{postMsg.msg['address.postalCode']}</Help>}
                        </Block>
                        <Button submit fullwidth color={'success'}>Přidat</Button>
                    </form>
                    {postMsg && typeof postMsg.msg === "string" && (
                        <p className={"has-text-danger"}>
                            {postMsg.msg}
                        </p>
                    )}
                </Box>
            </Container>
        </Fragment>
    )
}
