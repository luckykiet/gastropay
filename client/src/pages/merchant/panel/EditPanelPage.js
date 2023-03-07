import React, { Fragment, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, isValidImageUrl, isValidUrl } from '../../../utils';
import { Box, Heading, Form, Button, Container, Block } from "react-bulma-components";
import { Promise } from 'bluebird';
import 'rc-time-picker/assets/index.css';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import LoadingComponent from '../../../components/LoadingComponent';
import produce from 'immer';
import { useSetChoosenRestaurant } from '../../../stores/MerchantStores';
import OpeningTimeInputs from '../../../components/merchant/OpeningTimeInputs';
import { API } from '../../../config/api';
import { CONFIG } from '../../../config/config';

const { Field, Label, Control, Input, Help } = Form;
export default function EditPanelPage() {
    const idRestaurant = useParams().idRestaurant;
    const [restaurant, setRestaurant] = useState({});
    const [postMsg, setPostMsg] = useState({});
    const [loading, setLoading] = useState(true);
    const [apiTestLoading, setApiTestLoading] = useState(false);
    const [apiTestMsg, setApiTestMsg] = useState({});
    const setChoosenRestaurant = useSetChoosenRestaurant();

    useEffect(() => {
        setLoading(true);
        setPostMsg({});
        setApiTestMsg({});
        const fetchRestaurant = async () => {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${API.MERCHANT}/${API.RESTAURANT}/${idRestaurant}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })

                if (!success) {
                    throw new Error(msg);
                }
                setRestaurant(msg);
                setChoosenRestaurant(msg);
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(0).then(fetchRestaurant);
    }, [setChoosenRestaurant, idRestaurant]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "image") {
            if (!isValidImageUrl(value) && value !== '') {
                setPostMsg({
                    success: false,
                    msg: { image: "Nesprávný url pro obrázek" }
                })
            } else {
                setPostMsg({
                    success: true,
                    msg: {}
                })
            }
        } else if (name === "api.baseUrl") {
            if (!isValidUrl(value) && value !== '') {
                setPostMsg({
                    success: false,
                    msg: { "api.baseUrl": "Nesprávný url" }
                })
            } else {
                setPostMsg({
                    success: true,
                    msg: {}
                })
            }
        }

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
        setLoading(true);
        setPostMsg({});
        setApiTestMsg({});
        if (restaurant.name === '' || restaurant.address.street === '' || restaurant.address.city === '' || restaurant.address.postalCode === '') {
            setPostMsg({
                success: false,
                msg: "Zkontrolujte vyplněné údaje!"
            });
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const { data: { success, msg } } = await axios.put(
                    `api/${API.MERCHANT}/${API.RESTAURANT}/${idRestaurant}`,
                    JSON.stringify(restaurant), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });
                if (!success) {
                    throw new Error(msg);
                }
                console.log(msg);
                setPostMsg({
                    success: true,
                    msg: msg
                });
                setChoosenRestaurant(restaurant);

            } catch (err) {
                console.log(err)
                setPostMsg({
                    success: false,
                    msg: err?.response?.data.msg ? err.response.data.msg : err
                });
            } finally {
                setLoading(false);
            }
        }
    }

    const handleTestApiClick = async (e) => {
        e.preventDefault();
        setApiTestMsg({});
        if (restaurant.api.baseUrl === '' || restaurant.api.params === '') {
            setApiTestMsg({
                success: false,
                msg: "API url a parametry nesmí být prázdné"
            });
        } else {
            setApiTestLoading(true);
            try {
                const axios = createAxios(addSlashAfterUrl(restaurant.api.baseUrl));
                const { data: { success } } = await axios.get(`${restaurant.api.params}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                if (!success) {
                    throw new Error("Nepovedlo se připojit k API!")
                }

                setApiTestMsg({
                    success: true,
                    msg: "OK"
                });
            } catch (err) {
                console.log(err)
                setApiTestMsg({
                    success: false,
                    msg: err?.response?.data.msg ? err.response.data.msg : err
                });
            } finally {
                setApiTestLoading(false);
            }
        }
    }

    return (
        <Fragment>{loading ? (
            <LoadingComponent />
        ) : (
            Object.keys(restaurant).length === 0 ?
                (
                    <Fragment>
                        <Heading renderAs='p' size={5} className='has-text-weight-bold'>Chyba načítání restaurace, obnovte stránku</Heading>
                    </Fragment>
                )
                :
                (
                    <Fragment>
                        <Container py={5} breakpoint={'fluid'}>
                            <Box>
                                <form onSubmit={handleSubmit}>
                                    <Block>
                                        <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>Profile:</Heading>
                                        <div className='is-pulled-right'>
                                            <Heading renderAs='label' htmlFor={'checkBoxIsAvailable'} size={5} mr={4} className='has-text-weight-bold is-inline-block'>Aktivní: </Heading>
                                            <Toggle
                                                id='checkBoxIsAvailable'
                                                name={"isAvailable"}
                                                checked={restaurant.isAvailable}
                                                onChange={(e) => {
                                                    handleChange({ target: { name: "isAvailable", value: e.target.checked } });
                                                }}
                                            />
                                        </div>
                                        <Field>
                                            <Label htmlFor="inputName">
                                                Název
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.name ? "danger" : undefined} onChange={handleChange} name={"name"} value={restaurant.name} type={"text"} id="inputName" placeholder="Gastro bistro" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg.name && <Help color={'danger'}>{postMsg.msg.name}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputImage">
                                                Obrázek
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.image ? "danger" : undefined} onChange={handleChange} name={"image"} value={restaurant.image} type={"text"} id="inputImage" placeholder="Image URL" />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg.image && <Help color={'danger'}>{postMsg.msg.image}</Help>}
                                        </Field>
                                    </Block>
                                    <Block>
                                        <Heading renderAs='p' size={4} className='has-text-weight-bold'>Adresa:</Heading>
                                        <Field>
                                            <Label htmlFor="inputStreet">
                                                Ulice
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.street'] ? "danger" : undefined} onChange={handleChange} name={"address.street"} value={restaurant.address.street} type={"text"} id="inputStreet" placeholder="Na Porici 81" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.street'] && <Help color={'danger'}>{postMsg.msg['address.street']}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputCity">
                                                Město
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.city'] ? "danger" : undefined} onChange={handleChange} name={"address.city"} value={restaurant.address.city} type={"text"} id="inputCity" placeholder="Praha 1" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.city'] && <Help color={'danger'}>{postMsg.msg['address.city']}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputPsc">
                                                PSČ
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.postalCode'] ? "danger" : undefined} onChange={handleChange} name={"address.postalCode"} value={restaurant.address.postalCode} type={"text"} id="inputPsc" placeholder="11000" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.postalCode'] && <Help color={'danger'}>{postMsg.msg['address.postalCode']}</Help>}
                                        </Field>
                                    </Block>
                                    <Block>
                                        <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>Menu API:</Heading>
                                        <Button className='is-pulled-right' color={'warning'} onClick={handleTestApiClick}>Test API</Button>
                                        {apiTestLoading && <LoadingComponent />}
                                        <Field>
                                            <Label htmlFor="inputApiBaseUrl">
                                                Base URL
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['api.baseUrl'] ? "danger" : undefined} onChange={handleChange} name={"api.baseUrl"} value={restaurant.api.baseUrl} type={"text"} id="inputApiBaseUrl" placeholder="https://api.npoint.io/" />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['api.baseUrl'] && <Help color={'danger'}>{postMsg.msg['api.baseUrl']}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputApiParam">
                                                Parametry
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg['api.params'] ? "danger" : undefined} onChange={handleChange} name={"api.params"} value={restaurant.api.params} type={"text"} id="inputApiParam" placeholder="API Params" />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['api.params'] && <Help color={'danger'}>{postMsg.msg['api.params']}</Help>}
                                        </Field>
                                        {apiTestMsg && apiTestMsg.msg && (
                                            <p className={apiTestMsg.success ? "has-text-success" : "has-text-danger"}>
                                                {apiTestMsg.msg instanceof Error ? apiTestMsg.msg.message : typeof apiTestMsg.msg === "string" && apiTestMsg.msg}
                                            </p>
                                        )}
                                    </Block>
                                    <Heading renderAs='p' size={4} className='has-text-weight-bold'>Otevírací doba:</Heading>
                                    {Object.keys(restaurant.openingTime).map((key) => {
                                        return <OpeningTimeInputs handleChange={handleChange} restaurant={restaurant} setRestaurant={setRestaurant} key={key} day={key} />
                                    })}
                                    <Button id={"submitButton"} submit fullwidth color={'warning'}>Uložit</Button>
                                </form>
                                {postMsg && postMsg.msg && (
                                    <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                        {postMsg.msg instanceof Error ? postMsg.msg.message : typeof postMsg.msg === "string" && postMsg.msg}
                                    </p>
                                )}
                            </Box>
                        </Container>
                    </Fragment>)
        )
        }</Fragment>
    )
}
