import React, { Fragment, useState, useEffect } from 'react';
import { createAxios, addSlashAfterUrl } from '../../../utils';
import { Box, Heading, Form, Button, Container, Hero, Block } from "react-bulma-components";
import 'rc-time-picker/assets/index.css';
import "react-toggle/style.css";
import produce from 'immer';
import { useSetChosenRestaurant } from '../../../stores/MerchantStores';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../config/paths'
import { CONFIG } from '../../../config/config'
import { API } from '../../../config/api'
import LoadingComponent from '../../../components/LoadingComponent';

const { Body } = Hero;
const { Field, Label, Control, Input, Help } = Form;
export default function AddPanelPage() {
    const navigate = useNavigate();
    const [postMsg, setPostMsg] = useState({});
    const [loading, setLoading] = useState(false);
    const [restaurant, setRestaurant] = useState({
        name: "",
        address: {
            street: "",
            city: "",
            postalCode: ""
        }
    });
    const setChosenRestaurant = useSetChosenRestaurant();

    useEffect(() => {
        document.title = `Přidat restauraci | ${CONFIG.APP_NAME}`;
    }, [])

    useEffect(() => {
        setChosenRestaurant({});
    }, [setChosenRestaurant])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostMsg({});
        setRestaurant(
            produce((draft) => {
                const keys = name.split(".");
                const lastKey = keys.pop();
                let parent = draft;
                keys.forEach((key) => {
                    if (!parent[key]) {
                        parent[key] = {};
                    }
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
            setPostMsg({
                success: false,
                msg: "Zkontrolujte vyplněné údaje!"
            });
        } else {
            try {
                setLoading(true);
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const modifiedData = {
                    ...restaurant,
                }

                const { data: { success, msg } } = await axios.post(
                    `${API.MERCHANT}/${API.RESTAURANT}`,
                    JSON.stringify(modifiedData), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });

                if (!success) {
                    throw new Error(msg);
                }

                setChosenRestaurant(msg);
                navigate(PATHS.MERCHANT + "/" + PATHS.RESTAURANT_EDIT + "/" + msg._id);
            } catch (err) {
                setPostMsg({
                    success: false,
                    msg: err.response?.data.msg ? err.response.data.msg : err
                });
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <Fragment><Hero color="success" size="small">
            <Body>
                <Heading size={4}>Přidat novou restauraci</Heading>
            </Body>
        </Hero>
            {loading ? (
                <LoadingComponent />
            ) : (
                <Container py={5} breakpoint={'fluid'}>
                    <Box>
                        <form onSubmit={handleSubmit}>
                            <Block>
                                <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>Profile:</Heading>
                                <Field>
                                    <Label htmlFor="inputName">
                                        Název
                                    </Label>
                                    <Control>
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.name ? "danger" : undefined} onChange={handleChange} name={"name"} value={restaurant?.name} type={"text"} id="inputName" placeholder="Gastro bistro" required />
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
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.street'] ? "danger" : undefined} onChange={handleChange} name={"address.street"} value={restaurant.address?.street} type={"text"} id="inputStreet" placeholder="Na Porici 81" required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.street'] && <Help color={'danger'}>{postMsg.msg['address.street']}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="inputCity">
                                        Město
                                    </Label>
                                    <Control>
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.city'] ? "danger" : undefined} onChange={handleChange} name={"address.city"} value={restaurant.address?.city} type={"text"} id="inputCity" placeholder="Praha 1" required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.city'] && <Help color={'danger'}>{postMsg.msg['address.city']}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="inputPsc">
                                        PSČ
                                    </Label>
                                    <Control>
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.postalCode'] ? "danger" : undefined} onChange={handleChange} name={"address.postalCode"} value={restaurant.address?.postalCode} type={"text"} id="inputPsc" placeholder="11000" required />
                                    </Control>
                                </Field>
                                {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.postalCode'] && <Help color={'danger'}>{postMsg.msg['address.postalCode']}</Help>}
                            </Block>
                            <Button submit fullwidth color={'success'}>Přidat</Button>
                        </form>
                        {postMsg?.msg && (
                            <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                {postMsg.msg instanceof Error ? postMsg.msg.message : typeof postMsg.msg === "string" && postMsg.msg}
                            </p>
                        )}
                    </Box>
                </Container>
            )}

        </Fragment>
    )
}
