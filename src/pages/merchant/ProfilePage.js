import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Box, Content, Heading, Form, Icon, Button, Container, Block } from "react-bulma-components";
import React, { Fragment, useState, useEffect } from "react";
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import produce from "immer";
import { COMGATE, createAxios, addSlashAfterUrl, API_URL, PATHS } from '../../utils';
import LoadingComponent from "../../components/LoadingComponent";
import { Promise } from "bluebird";

const { Field, Label, Control, Input, Select, Help } = Form;

export default function ProfilePage() {
    const [postMsg, setPostMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [comgate, setComgate] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPostMsg(null);
        if (comgate.merchant === '' || comgate.secret === '' || comgate.label === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const modifiedData = {
                    paymentGates: {
                        comgate: comgate
                    },
                    password: password
                }
                const { data: { success, msg } } = await axios.put(
                    `api/${PATHS.API.MERCHANT}`,
                    JSON.stringify(modifiedData), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });
                if (success) {
                    console.log(msg);
                    setPassword('')
                    setComgate(msg.paymentGates.comgate);
                } else {
                    setPostMsg(msg);
                }
            } catch (err) {
                console.log(err.response.data.msg)
                setPostMsg(err.response.data.msg);
            } finally {
                setLoading(false);
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setComgate(
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

    useEffect(() => {
        setLoading(true);
        setPostMsg(null);
        const fetchRestaurant = async () => {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`api/${PATHS.API.MERCHANT}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })
                if (success) {
                    setComgate(msg.paymentGates.comgate);
                }
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(300).then(fetchRestaurant);
    }, []);

    return (
        <Fragment>{loading ? (
            <LoadingComponent />
        ) : (
            <Fragment>
                <Content textAlign={"center"}>
                    <Heading pt={5} spaced>Profile</Heading>
                </Content>
                <Container className="has-text-left">
                    <Box style={{ width: "400px", margin: 'auto' }}>
                        <Block>
                            <form onSubmit={handleSubmit}>
                                <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>Comgate:</Heading>
                                <div className='is-pulled-right'>
                                    <Heading renderAs='label' htmlFor={'checkBoxIsAvailable'} size={5} mr={4} className='has-text-weight-bold is-inline-block'>Aktivní: </Heading>
                                    <Toggle
                                        id='checkBoxIsAvailable'
                                        name={"isAvailable"}
                                        checked={comgate.isAvailable}
                                        onChange={(e) => {
                                            handleChange({ target: { name: "isAvailable", value: e.target.checked } });
                                        }}
                                    />
                                </div>
                                <Block>
                                    <Button.Group>
                                        <Button renderAs="a" color={"info"} target="_blank" href="https://portal.comgate.cz">Portál</Button>
                                        <Button renderAs="a" color={"link"} target="_blank" href="https://help.comgate.cz/docs/api-protokol">API Dokumentace</Button>
                                    </Button.Group>
                                </Block>
                                <Field>
                                    <Label htmlFor="inputMerchant">
                                        Merchant ID - merchant
                                    </Label>
                                    <Control>
                                        <Input name={"merchant"} value={comgate.merchant} onChange={handleChange} id="inputMerchant" type="text" placeholder="Merchant ID" required />
                                    </Control>
                                    {postMsg?.merchant && <Help color={'danger'}>{postMsg.merchant}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="checkBoxIsTestMode">
                                        Testovací režim - test
                                    </Label>
                                    <Toggle
                                        id='checkBoxIsTestMode'
                                        name={"test"}
                                        checked={comgate.test}
                                        onChange={(e) => {
                                            handleChange({ target: { name: "test", value: e.target.checked } });
                                        }}
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="selectCountries">
                                        Státy - country
                                    </Label>
                                    <Control>
                                        <Select name="country" onChange={handleChange} defaultValue={comgate.country} id="selectCountries">
                                            {COMGATE.COUNTRIES.map((country) => (
                                                <option value={country} key={country}>{country}</option>
                                            ))}
                                        </Select>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputLabel">
                                        Popis produktu - popis
                                    </Label>
                                    <Control>
                                        <Input name={"label"} value={comgate.label} onChange={handleChange} id="inputLabel" type="text" placeholder="Popis produktu" required />
                                    </Control>
                                    {postMsg?.label && <Help color={'danger'}>{postMsg.label}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="selectMethods">
                                        Metody - method
                                    </Label>
                                    <Control>
                                        <Select name="method" onChange={handleChange} defaultValue={comgate.method} id="selectMethods">
                                            {COMGATE.METHODS.map((method) => (
                                                <option value={method} key={method}>{method}</option>
                                            ))}
                                        </Select>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputSecret">
                                        Secret - secret
                                    </Label>
                                    <Control>
                                        <Input name={"secret"} value={comgate.secret} onChange={handleChange} id="inputSecret" type="text" placeholder="Secret" required />
                                    </Control>
                                    {postMsg?.secret && <Help color={'danger'}>{postMsg.secret}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="selectCurrency">
                                        Platební měna - curr
                                    </Label>
                                    <Control>
                                        <Select name="curr" onChange={handleChange} defaultValue={comgate.curr} id="selectCurrency">
                                            {COMGATE.CURRENCIES.map((currency) => (
                                                <option value={currency} key={currency}>{currency}</option>
                                            ))}
                                        </Select>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputPassword">
                                        Heslo
                                    </Label>
                                    <Control>
                                        <Input name={"password"} value={password} onChange={(e) => setPassword(e.target.value)} id="inputPassword" type="password" placeholder="*************" required />
                                        <Icon align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                    </Control>
                                    {postMsg?.password && <Help color={'danger'}>{postMsg.password}</Help>}
                                </Field>
                                <Button submit fullwidth color={'warning'}>Uložit</Button>
                            </form>
                            {postMsg !== null && Object.keys(postMsg).length === 0 && <p className="has-text-danger">{postMsg}</p>}
                        </Block>
                    </Box>
                </Container>
            </Fragment>)}
        </Fragment>
    )
}