import React, { Fragment, useEffect, useState, useLayoutEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Block, Content, Heading, Form, Icon, Button, Container } from "react-bulma-components";
import { Link, useParams } from 'react-router-dom';
import { createAxios, addSlashAfterUrl } from "../../utils";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import { PATHS } from '../../config/paths';
import { API } from '../../config/api';
import { CONFIG } from '../../config/config';
import { Promise } from "bluebird";

const { Field, Label, Control, Input, Help } = Form;

export default function RenewPasswordPage() {
    const { token } = useParams();
    const [postMsg, setPostMsg] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(null);
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [loading, setLoading] = useState(false);

    useLayoutEffect(() => {
        document.title = `Obnovení hesla | ${CONFIG.APP_NAME}`;
    }, [])

    const handleConfirmNewPasswordChange = (e) => {
        const { value } = e.target;
        setConfirmNewPassword(value);
        setPasswordsMatch(!value || !newPassword ? null : value === newPassword);
        setPostMsg({});
    }

    const handleNewPasswordChange = (e) => {
        const { value } = e.target;
        setNewPassword(value);
        setPasswordsMatch(!value || !confirmNewPassword ? null : value === confirmNewPassword);
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
        setIsPasswordValid(passwordRegex.test(value) || value.length === 0);
        setPostMsg({});
    }

    const handleSubmitPasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPostMsg({});
        if (newPassword === '' || confirmNewPassword === '' || passwordsMatch === null || !passwordsMatch || !isPasswordValid) {
            setPostMsg({
                success: false,
                msg: "Zkontrolujte vyplněné údaje!"
            });
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const modifiedData = {
                    newPassword: newPassword,
                    confirmNewPassword: confirmNewPassword
                }
                const { data: { success, msg } } = await axios.put(
                    `${API.AUTH}/${API.CHANGE_PASSWORD}`,
                    JSON.stringify(modifiedData), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + token
                    }
                });

                if (!success) {
                    throw new Error(msg);
                }

                setPostMsg({
                    success: true,
                    msg: msg
                });
            } catch (err) {
                console.log(err)
                setPostMsg({
                    success: false,
                    msg: err?.response?.data.msg ? err?.response?.data.msg : err
                });
            }
        }
        setLoading(false);
    }

    useEffect(() => {
        if (token !== '') {
            const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
            const checkToken = async () => {
                try {
                    const { data: { success, msg } } = await axios.get(`${API.AUTH}/${API.CHANGE_PASSWORD}`, {
                        headers: {
                            "Authorization": "Bearer " + token
                        }
                    });
                    if (!success) {
                        throw new Error(msg);
                    }
                    setIsValidToken(true);
                } catch (error) {
                    console.log(error.response?.data.msg ? error.response.data.msg : error);
                    setIsValidToken(false)
                }
            };
            Promise.delay(0).then(checkToken);
        }
    }, [token])

    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Změna hesla</Heading>
            </Content>
            <Container breakpoint={"fluid"}>
                <Box>
                    {!isValidToken ?
                        <Container className="has-text-centered">
                            <p className="is-size-4">Neplatný odkaz nebo váš požadavek vypršel.</p>
                        </Container>
                        :
                        <Fragment>
                            {postMsg && postMsg.success ?
                                <Container className="has-text-centered">
                                    <p className="has-text-success is-size-4">Heslo úspěšně změněno. <Link to={PATHS.LOGIN}>Přihlásit se</Link></p>
                                </Container>
                                :
                                <form onSubmit={handleSubmitPasswordChange}>
                                    <Block>
                                        <Field>
                                            <Label htmlFor="inputNewPassword">
                                                Nové heslo
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.newPassword ? "danger" : undefined} name={"newPassword"} value={newPassword} onChange={handleNewPasswordChange} id="inputNewPassword" type="password" placeholder="*************" required />
                                                <Icon color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.newPassword ? "danger" : undefined} align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                            </Control>
                                            {!isPasswordValid && <Help color="danger">Heslo musí obsahovat alespoň 8 znaků, 1 velké, 1 malé písmeno a 1 číslici</Help>}
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg.newPassword && <Help color={'danger'}>{postMsg.msg.newPassword}</Help>}
                                        </Field>
                                        <Field>
                                            <Label htmlFor="inputConfirmNewPassword">
                                                Kontrola nového hesla
                                            </Label>
                                            <Control>
                                                <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.confirmNewPassword ? "danger" : undefined} name={"confirmNewPassword"} value={confirmNewPassword} onChange={handleConfirmNewPasswordChange} id="inputConfirmNewPassword" type="password" placeholder="*************" required />
                                                <Icon color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.confirmNewPassword ? "danger" : undefined} align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                            </Control>
                                            {passwordsMatch !== null && !passwordsMatch && <Help color={"danger"}>Hesla neshodují!</Help>}
                                            {postMsg && typeof postMsg.msg === "object" && postMsg.msg.confirmNewPassword && <Help color={'danger'}>{postMsg.msg.confirmNewPassword}</Help>}
                                        </Field>
                                        {loading ? <Button className="is-loading" disabled fullwidth color={'warning'} /> : <Button submit fullwidth color={'warning'}>Změnit heslo</Button>}
                                    </Block>
                                    {postMsg && postMsg.msg && (
                                        <p className={"has-text-danger"}>
                                            {postMsg.msg instanceof Error ? postMsg.msg.message : typeof postMsg.msg === "string" && postMsg.msg}
                                        </p>
                                    )}
                                </form>}
                        </Fragment>
                    }
                </Box>
            </Container>
        </Fragment>
    )
}
