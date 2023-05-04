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
import { CSOB } from '../../../config/csob';

const { Field, Label, Control, Input, Textarea, Help, Select } = Form;

export default function CsobPanel() {
    const [postMsg, setPostMsg] = useState({});
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [csob, setCsob] = useState({});

    useEffect(() => {
        document.title = `ČSOB | ${CONFIG.APP_NAME}`;
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPostMsg({});
        if (csob.merchantId === '' || csob.privateKey === '' || csob.publicKey === '') {
            setPostMsg({
                success: false,
                msg: "Zkontrolujte vyplněné údaje!"
            });
            setLoading(false);
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const modifiedData = {
                    paymentGates: {
                        csob: csob
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
                setCsob(msg.paymentGates.csob);
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
        setCsob(
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

                setCsob(msg.paymentGates.csob);
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(0).then(fetchPaymentGate);
    }, []);

    return (
        <Fragment>{loading ? (
            <ProgressBar />
        ) : (
            <Fragment>
                <Content textAlign={"center"}>
                    <Heading pt={5} spaced>ČSOB</Heading>
                </Content>
                <Container className="has-text-left is-max-desktop">
                    <Box>
                        <Block>
                            <form onSubmit={handleSubmit}>
                                <Heading renderAs='p' size={4} className='has-text-weight-bold is-inline-block'>ČSOB:</Heading>
                                <div className='is-pulled-right'>
                                    <Heading renderAs='label' htmlFor={'checkBoxIsAvailable'} size={5} mr={4} className='has-text-weight-bold is-inline-block'>Aktivní: </Heading>
                                    <Toggle
                                        id='checkBoxIsAvailable'
                                        name={"isAvailable"}
                                        checked={csob.isAvailable}
                                        onChange={(e) => {
                                            handleChange({ target: { name: "isAvailable", value: e.target.checked } });
                                        }}
                                    />
                                </div>
                                <Block>
                                    <Button.Group>
                                        <Button renderAs="a" color={"info"} target="_blank" href="https://posman.csob.cz/posmerchant">Portál</Button>
                                        <Button renderAs="a" color={"link"} target="_blank" href="https://github.com/csob/platebnibrana/wiki/Základn%C3%AD-metody">API Dokumentace</Button>
                                        <Button renderAs="a" color={"primary"} target="_blank" href="https://platebnibrana.csob.cz/keygen/">Generování klíčů</Button>
                                        <Button renderAs="a" color={"warning"} target="_blank" href="https://iplatebnibrana.csob.cz/keygen/">Generování testovacích klíčů</Button>
                                    </Button.Group>
                                </Block>
                                <Field>
                                    <Label htmlFor="inputMerchantId">
                                        Merchant ID - merchantId
                                    </Label>
                                    <Control>
                                        <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.merchantId ? "danger" : undefined} name={"merchantId"} value={csob.merchantId} onChange={handleChange} id="inputMerchantId" type="text" placeholder="Merchant ID" required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.merchantId && <Help color={'danger'}>{postMsg.msg.merchantId}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="checkBoxIsTestMode">
                                        Testovací režim - test
                                    </Label>
                                    <Toggle
                                        id='checkBoxIsTestMode'
                                        name={"test"}
                                        checked={csob.test}
                                        onChange={(e) => {
                                            handleChange({ target: { name: "test", value: e.target.checked } });
                                        }}
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="inputPrivateKey">
                                        Privátní klíč - privateKey
                                    </Label>
                                    <Control>
                                        <Textarea color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.p ? "danger" : undefined} name={"privateKey"} value={csob.privateKey} onChange={handleChange} id="inputPrivateKey" type="text" placeholder={"-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"} required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.privateKey && <Help color={'danger'}>{postMsg.msg.privateKey}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="inputPublicKey">
                                        Veřejný klíč - publicKey
                                    </Label>
                                    <Control>
                                        <Textarea color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.p ? "danger" : undefined} name={"publicKey"} value={csob.publicKey} onChange={handleChange} id="inputPublicKey" type="text" placeholder={"-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"} required />
                                    </Control>
                                    {postMsg && typeof postMsg.msg === "object" && postMsg.msg.publicKey && <Help color={'danger'}>{postMsg.msg.publicKey}</Help>}
                                </Field>
                                <Field>
                                    <Label htmlFor="checkBoxIsClosePayment">
                                        Automatická úzavěrka - closePayment
                                    </Label>
                                    <Toggle
                                        id='checkBoxIsClosePayment'
                                        name={"closePayment"}
                                        checked={csob.closePayment}
                                        onChange={(e) => {
                                            handleChange({ target: { name: "closePayment", value: e.target.checked } });
                                        }}
                                    />
                                </Field>
                                <Field>
                                    <Label htmlFor="selectPayOperations">
                                        Platební operace - payOperation
                                    </Label>
                                    <Control>
                                        <Select disabled={CSOB.PAY_OPERATIONS_DISABLED} name="payOperation" onChange={handleChange} defaultValue={csob.payOperation} id="selectPayOperations">
                                            {CSOB.PAY_OPERATIONS.map((operation) => (
                                                <option value={operation} key={operation}>{operation}</option>
                                            ))}
                                        </Select>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="selectPayMethods">
                                        Platební metoda - payMethod
                                    </Label>
                                    <Control>
                                        <Select disabled={CSOB.PAYMENT_METHODS_DISABLED} name="payMethod" onChange={handleChange} defaultValue={csob.payMethod} id="selectPayMethods">
                                            {CSOB.PAYMENT_METHODS.map((method) => (
                                                <option value={method} key={method}>{method}</option>
                                            ))}
                                        </Select>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="selectCurrencies">
                                        Platební měna - currency
                                    </Label>
                                    <Control>
                                        <Select disabled={CSOB.CURRENCIES_DISABLED} name="currency" onChange={handleChange} defaultValue={csob.currency} id="selectCurrencies">
                                            {CSOB.CURRENCIES.map((currency) => (
                                                <option value={currency} key={currency}>{currency}</option>
                                            ))}
                                        </Select>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="selectLanguages">
                                        Jazyk - language
                                    </Label>
                                    <Control>
                                        <Select disabled={CSOB.LANGUAGES_DISABLED} name="language" onChange={handleChange} defaultValue={csob.language} id="selectLanguages">
                                            {CSOB.LANGUAGES.map((language) => (
                                                <option value={language} key={language}>{language}</option>
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
