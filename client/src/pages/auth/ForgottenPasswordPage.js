import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Box, Content, Heading, Form, Icon, Button, Container } from "react-bulma-components";
import React, { Fragment, useState, useEffect } from "react";
import { createAxios, addSlashAfterUrl } from "../../utils";
import { CONFIG } from "../../config/config";
import { API } from "../../config/api";
import { useLocation } from "react-router-dom";

const { Field, Label, Control, Input, Help } = Form;
export default function ForgottenPasswordPage() {
    const [postMsg, setPostMsg] = useState('');
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();

    useEffect(() => {
        document.title = `Zapomenuté heslo | ${CONFIG.APP_NAME}`;
    }, [location])

    const handleChange = (e) => {
        const { value } = e.target;
        setEmail(value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsEmailValid(emailRegex.test(value) || value.length === 0);
        setPostMsg('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPostMsg('');
        setLoading(true);
        if (email === '' || !isEmailValid) {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const { data: { success, msg } } = await axios.post(
                    `${API.AUTH}/${API.CHANGE_PASSWORD}`,
                    JSON.stringify({ email: email.toLowerCase() }), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!success) {
                    throw new Error(msg);
                }
                setPostMsg({ success: true, msg: "Požadavek poslán! Zkontrolujte svůj email." });
            } catch (err) {
                setPostMsg({
                    success: false,
                    msg: err.response?.data.msg ? err.response.data.msg : err
                });
            }
        }
        setLoading(false);
    };
    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Obnovit heslo</Heading>
            </Content>
            <Container breakpoint={"fluid"}>
                <Box>
                    {postMsg !== '' && postMsg.success ?
                        <Container className="has-text-centered">
                            <p className="has-text-success is-size-4">{postMsg.msg}</p>
                        </Container>
                        :
                        <Fragment>
                            <form onSubmit={handleSubmit}>
                                <Field>
                                    <Label htmlFor="inputEmail">
                                        Email
                                    </Label>
                                    <Control>
                                        <Input color={isEmailValid !== null && !isEmailValid && "danger"} name={"email"} value={email} onChange={handleChange} id="inputEmail" type={"email"} placeholder="gastropay@vse.cz" required />
                                        <Icon color={isEmailValid !== null && !isEmailValid && "danger"} align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                                        {isEmailValid !== null && !isEmailValid && <Help color="danger">Nesprávný email formát</Help>}
                                    </Control>
                                </Field>
                                {loading ? <Button className="is-loading" disabled fullwidth color={'warning'} /> : <Button submit fullwidth color={'warning'}>Obnovit heslo</Button>}
                            </form>
                            {postMsg && !postMsg.success && (<p className="has-text-danger">{postMsg.msg instanceof Error ? postMsg.msg.message : postMsg.msg}</p>)}
                        </Fragment>
                    }
                </Box>
            </Container>
        </Fragment>
    )
}