import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Box, Content, Heading, Form, Icon, Button, Container } from "react-bulma-components";
import React, { Fragment, useState, useEffect, useCallback } from "react";
import { checkICO, createAxios, API_URL, addSlashAfterUrl } from "../../utils";
import { Promise } from "bluebird";

const { Field, Label, Control, Input, Checkbox, Help } = Form;

export default function RegisterPage() {
    const [icoCheckMsg, setIcoCheckMsg] = useState('');
    const [formData, setFormData] = useState({
        ico: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const { ico, email, password, confirmPassword } = formData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            setFormData({ ico: '', email: '', password: '' });
        } else {
            console.error('Error submitting post form');
        }
    }


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const fetchData = useCallback(async () => {
        try {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            const { data: { msg } } = await axios.get(`api/merchant/check?ico=${ico}`);
            setIcoCheckMsg(msg ? "IČO je již registrováno!" : 'OK');
        } catch (err) {
            setIcoCheckMsg('');
            console.log(err);
        }
    }, [ico]);

    useEffect(() => {
        if (ico.length < 8) {
            setIcoCheckMsg('');
            return;
        } else if (ico.length > 8) {
            setIcoCheckMsg("Nevalidní IČO!");
            return;
        } else {
            if (!checkICO(ico)) {
                setIcoCheckMsg("Nevalidní IČO!");
                return;
            }
            Promise.delay(0).then(fetchData);
        }
    }, [ico, fetchData])

    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Registrační formulář</Heading>
            </Content>
            <Container className="has-text-left">
                <Box style={{ width: "400px", margin: 'auto' }}>
                    <form onSubmit={handleSubmit}>
                        <Field>
                            <Label htmlFor="inputIco">
                                IČO
                            </Label>
                            <Control>
                                <Input color={icoCheckMsg !== '' ? (icoCheckMsg === "OK" ? "success" : "danger") : undefined} name={"ico"} value={ico} type={"search"} onChange={handleChange} id="inputIco" placeholder="12345678" required />
                                <Icon color={icoCheckMsg !== '' ? (icoCheckMsg === "OK" ? "success" : "danger") : undefined} align="left"><FontAwesomeIcon icon={icoCheckMsg !== '' ? (icoCheckMsg === "OK" ? faCheck : faExclamationTriangle) : faUser} /></Icon>
                            </Control>
                            {(icoCheckMsg !== '' && icoCheckMsg !== "OK") ? <Help color={"danger"}>{icoCheckMsg}</Help> : ""}
                        </Field>
                        <Field>
                            <Label htmlFor="inputEmail">
                                Email
                            </Label>
                            <Control>
                                <Input name={"email"} value={email} onChange={handleChange} id="inputEmail" type={"email"} placeholder="gastropay@vse.cz" required />
                                <Icon align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                            </Control>
                        </Field>
                        <Field>
                            <Label htmlFor="inputPassword">
                                Heslo
                            </Label>
                            <Control>
                                <Input name={"password"} value={password} onChange={handleChange} id="inputPassword" type="password" placeholder="*************" required />
                                <Icon align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                            </Control>
                        </Field>
                        <Field>
                            <Label htmlFor="inputConfirmPassword">
                                Ověření hesla
                            </Label>
                            <Control>
                                <Input name={"confirmPassword"} value={confirmPassword} onChange={handleChange} id="inputConfirmPassword" type="password" placeholder="*************" required />
                                <Icon align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                            </Control>
                        </Field>
                        <Field>
                            <Control>
                                <Checkbox id="agreementCheckBox">&nbsp;Souhlasíte s podmínky</Checkbox>
                            </Control>
                        </Field>
                        <Button submit fullwidth color={'warning'}>Zaregistrovat se</Button>
                    </form>
                </Box>
            </Container>
        </Fragment>
    )
}