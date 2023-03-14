import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { Box, Content, Heading, Form, Icon, Button, Container, Block } from "react-bulma-components";
import React, { Fragment, useState, useEffect } from "react";
import Toggle from 'react-toggle';
import "react-toggle/style.css";
import produce from "immer";
import { createAxios, addSlashAfterUrl } from '../../../utils';
import ProgressBar from "../../../components/ProgressBar";
import { Promise } from "bluebird";
import { API } from '../../../config/api';
import { CONFIG } from '../../../config/config';
import { COMGATE } from '../../../config/comgate';

const { Field, Label, Control, Input, Select, Help } = Form;

export default function ComgatePanel() {
    const [postMsg, setPostMsg] = useState({});
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [comgate, setComgate] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPostMsg({});
        if (comgate.merchant === '' || comgate.secret === '' || comgate.label === '') {
            setPostMsg({
                success: false,
                msg: "Zkontrolujte vyplněné údaje!"
            });
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const modifiedData = {
                    paymentGates: {
                        comgate: comgate
                    },
                    password: password
                }
                const { data: { success, msg } } = await axios.put(
                    `${API.MERCHANT}`,
                    JSON.stringify(modifiedData), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });

                if (!success) {
                    throw new Error(msg);
                }
                setPassword('');
                setPostMsg({
                    success: true,
                    msg: "Úspěšně aktualizováno!"
                });
                setComgate(msg.paymentGates.comgate);
            } catch (err) {
                console.log(err)
                setPostMsg({
                    success: false,
                    msg: err?.response?.data.msg ? err?.response?.data.msg : err
                });
            } finally {
                setLoading(false);
            }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPostMsg({});
        setComgate(
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

    useEffect(() => {
        setLoading(true);
        setPostMsg({});
        const fetchPaymentGate = async () => {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            try {
                const { data: { success, msg } } = await axios.get(`${API.MERCHANT}`, {
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                })

                if (!success) {
                    throw new Error(msg)
                }

                setComgate(msg.paymentGates.comgate);
                //add more payment gates
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(300).then(fetchPaymentGate);
    }, []);

    return (
        <Fragment>{loading ? (
            <ProgressBar />
        ) : (
            <Fragment>
                <Content textAlign={"center"}>
                    <Heading pt={5} spaced>Comgate</Heading>
                </Content>
                <Container className="has-text-left is-max-desktop">
                    <Box>
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
                                        <Button renderAs="a" color={"link"} target="_blank" href="https://help.comgate.cz/docs/api-protokol#založen%C3%AD-platby">API Dokumentace</Button>
                                    </Button.Group>
                                </Block>
                                <Field>
                                    <Label htmlFor="inputMerchant">
                                        Merchant ID - merchant
                                    </Label>
                                    <Control>
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.merchant ? "danger" : undefined} name={"merchant"} value={comgate.merchant} onChange={handleChange} id="inputMerchant" type="text" placeholder="Merchant ID" required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.merchant && <Help color={'danger'}>{postMsg.msg.merchant}</Help>}
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
                                        <Select disabled={COMGATE.COUNTRIES_DISABLED} name="country" onChange={handleChange} defaultValue={comgate.country} id="selectCountries">
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
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.label ? "danger" : undefined} name={"label"} value={comgate.label} onChange={handleChange} id="inputLabel" type="text" placeholder="Popis produktu" required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.label && <Help color={'danger'}>{postMsg.msg.label}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="selectMethods">
                                        Metody - method
                                    </Label>
                                    <Control>
                                        <Select disabled={COMGATE.METHODS_DISABLED} name="method" onChange={handleChange} defaultValue={comgate.method} id="selectMethods">
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
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.secret ? "danger" : undefined} name={"secret"} value={comgate.secret} onChange={handleChange} id="inputSecret" type="text" placeholder="Secret" required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.secret && <Help color={'danger'}>{postMsg.msg.secret}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="selectCurrency">
                                        Platební měna - curr
                                    </Label>
                                    <Control>
                                        <Select disabled={COMGATE.CURRENCIES_DISABLED} name="curr" onChange={handleChange} defaultValue={comgate.curr} id="selectCurrency">
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
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.password ? "danger" : undefined} name={"password"} value={password} onChange={(e) => setPassword(e.target.value)} id="inputPassword" type="password" placeholder="*************" required />
                                        <Icon color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.password ? "danger" : undefined} align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.password && <Help color={'danger'}>{postMsg.msg.password}</Help>}
                                </Field>
                                <Button submit fullwidth color={'warning'}>Uložit</Button>
                            </form>
                            {postMsg && postMsg.msg && (
                                <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                    {postMsg.msg instanceof Error ? postMsg.msg.message : typeof postMsg.msg === "string" && postMsg.msg}
                                </p>
                            )}
                        </Block>
                    </Box>
                </Container>
            </Fragment>)}
        </Fragment>
    )
}
