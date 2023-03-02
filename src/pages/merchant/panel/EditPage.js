import React, { Fragment, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl, API_URL, PATHS } from '../../../utils';
import { Box, Heading, Form, Button, Container, Hero, Block, Tabs } from "react-bulma-components";
import { Promise } from 'bluebird';
import 'rc-time-picker/assets/index.css';
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import LoadingComponent from '../../../components/LoadingComponent';
import produce from 'immer';
import { useChoosenRestaurant, useSetChoosenRestaurant } from '../../../stores/MerchantStores';
import ConfirmBox from '../../../components/merchant/ConfirmBox';
import OpeningTimeInputs from '../../../components/merchant/OpeningTimeInputs';

const { Body } = Hero;
const { Field, Label, Control, Input, Help } = Form;
const { Tab } = Tabs;
export default function EditPage() {
    const idRestaurant = useParams().idRestaurant;
    const [restaurant, setRestaurant] = useState({});
    const [postMsg, setPostMsg] = useState({});
    const [loading, setLoading] = useState(true);
    const [choosenRestaurant, setChoosenRestaurant] = [useChoosenRestaurant(), useSetChoosenRestaurant()];
    const [showConfirmBox, setShowConfirmBox] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setPostMsg({});
        const fetchRestaurant = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}/${idRestaurant}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (success) {
                    console.log(msg)
                    setRestaurant(msg);
                    setChoosenRestaurant(msg);
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(0).then(fetchRestaurant);
    }, [setChoosenRestaurant, idRestaurant]);

    const handleDeleteButtonClick = (e) => {
        e.preventDefault();
        setShowConfirmBox(true);
    };

    const handleConfirm = async () => {
        try {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            const { data: { success, msg } } = await axios.delete(
                `api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}/${idRestaurant}`, {
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem('token')
                }
            });

            if (success) {
                setChoosenRestaurant({});
                setPostMsg({
                    success: true,
                    msg: msg
                });
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
        setShowConfirmBox(false);
    };

    const handleCancel = () => {
        setShowConfirmBox(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

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
        if (restaurant.name === '' || restaurant.address.street === '' || restaurant.address.city === '' || restaurant.address.postalCode === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const { data: { success, msg } } = await axios.put(
                    `api/${PATHS.API.MERCHANT}/${PATHS.API.RESTAURANT}/${idRestaurant}`,
                    JSON.stringify(restaurant), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });
                if (success) {
                    console.log(msg);
                    setPostMsg({
                        success: true,
                        msg: msg
                    });
                    setChoosenRestaurant(restaurant);
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
            } finally {
                setLoading(false);
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
                        {showConfirmBox && (
                            <ConfirmBox
                                message={'Chcete smazat ' + choosenRestaurant.name + '?'}
                                yesText={"Smazat"}
                                noText={"Zrušit"}
                                title={"Smazat restauraci"}
                                onConfirm={handleConfirm}
                                onCancel={handleCancel}
                            />
                        )}
                        <Hero color="link" size="small">
                            <Body>
                                <Heading size={4} className='is-inline-block'>{choosenRestaurant.name}</Heading>
                                <Button color={'danger'} size={'medium'} className='is-pulled-right' onClick={handleDeleteButtonClick}>Smazat</Button>
                            </Body>
                        </Hero>
                        <Container py={5} breakpoint={'fluid'}>
                            <Tabs size={'large'}>
                                <Tab active>
                                    Edit
                                </Tab>
                                <Tab onClick={() => navigate(PATHS.ROUTERS.MERCHANT + "/" + PATHS.ROUTERS.RESTAURANT_TRANSACTION + "/" + idRestaurant)}>
                                    Transakce
                                </Tab>
                            </Tabs>
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
                                                <Input onChange={handleChange} name={"name"} value={restaurant?.name} type={"text"} id="inputName" placeholder="Gastro bistro" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg.name && <Help color={'danger'}>{postMsg.msg.name}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputImage">
                                                Obrázek
                                            </Label>
                                            <Control>
                                                <Input onChange={handleChange} name={"image"} value={restaurant?.image} type={"text"} id="inputImage" placeholder="Image URL" />
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
                                                <Input onChange={handleChange} name={"address.street"} value={restaurant.address?.street} type={"text"} id="inputStreet" placeholder="Na Porici 81" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.street'] && <Help color={'danger'}>{postMsg.msg['address.street']}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputCity">
                                                Město
                                            </Label>
                                            <Control>
                                                <Input onChange={handleChange} name={"address.city"} value={restaurant.address?.city} type={"text"} id="inputCity" placeholder="Praha 1" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.city'] && <Help color={'danger'}>{postMsg.msg['address.city']}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputPsc">
                                                PSČ
                                            </Label>
                                            <Control>
                                                <Input onChange={handleChange} name={"address.postalCode"} value={restaurant.address?.postalCode} type={"text"} id="inputPsc" placeholder="11000" required />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['address.postalCode'] && <Help color={'danger'}>{postMsg.msg['address.postalCode']}</Help>}
                                        </Field>
                                    </Block>
                                    <Block>
                                        <Heading renderAs='p' size={4} className='has-text-weight-bold'>Menu API:</Heading>
                                        <Field>
                                            <Label htmlFor="inputApiBaseUrl">
                                                Base URL
                                            </Label>
                                            <Control>
                                                <Input onChange={handleChange} name={"api.baseUrl"} value={restaurant.api?.baseUrl} type={"text"} id="inputApiBaseUrl" placeholder="https://api.npoint.io/" />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['api.baseUrl'] && <Help color={'danger'}>{postMsg.msg['api.baseUrl']}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputApiParam">
                                                Parametry
                                            </Label>
                                            <Control>
                                                <Input onChange={handleChange} name={"api.params"} value={restaurant.api?.params} type={"text"} id="inputApiParam" placeholder="API Params" />
                                            </Control>
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg['api.params'] && <Help color={'danger'}>{postMsg.msg['api.params']}</Help>}</Field>
                                    </Block>
                                    <Heading renderAs='p' size={4} className='has-text-weight-bold'>Otevírací doba:</Heading>
                                    {Object.keys(restaurant.openingTime).map((key) => {
                                        return <OpeningTimeInputs handleChange={handleChange} restaurant={restaurant} setRestaurant={setRestaurant} key={key} day={key} />
                                    })}
                                    <Button id={"submitButton"} submit fullwidth color={'warning'}>Uložit</Button>
                                </form>
                                {postMsg && typeof postMsg.msg === "string" && (
                                    <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                        {postMsg.msg}
                                    </p>
                                )}
                            </Box>
                        </Container>
                    </Fragment>)
        )
        }</Fragment>
    )
}
