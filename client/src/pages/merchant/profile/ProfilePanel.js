import React, { Fragment, useState, useEffect } from 'react'
import ProgressBar from '../../../components/ProgressBar'
import { Content, Heading, Container, Box, Block, Form, Icon, Button } from 'react-bulma-components';
import { Promise } from 'bluebird';
import { createAxios, addSlashAfterUrl } from '../../../utils';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { API } from '../../../config/api';
import { CONFIG } from '../../../config/config';

const { Field, Label, Control, Input, Help } = Form;

export default function ProfilePanel() {
    const [loading, setLoading] = useState(true);
    const [merchant, setMerchant] = useState({});
    const [postMsg, setPostMsg] = useState({});
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(null);
    const [isPasswordValid, setIsPasswordValid] = useState(true);

    useEffect(() => {
        setLoading(true);
        setPostMsg({});
        const fetchRestaurant = async () => {
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

                setMerchant(msg);
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false);
            }
        }
        Promise.delay(0).then(fetchRestaurant);
    }, []);


    const handleSubmitPasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPostMsg({});
        if (currentPassword === '' || newPassword === '' || confirmNewPassword === '' || passwordsMatch === null || !passwordsMatch || !isPasswordValid) {
            setPostMsg({
                success: false,
                msg: "Zkontrolujte vyplněné údaje!"
            });
            setLoading(false);
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const modifiedData = {
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    confirmNewPassword: confirmNewPassword
                }
                console.log(modifiedData)
                const { data: { success, msg } } = await axios.put(
                    `${API.MERCHANT}/${API.CHANGE_PASSWORD}`,
                    JSON.stringify(modifiedData), {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": "Bearer " + localStorage.getItem('token')
                    }
                });

                if (!success) {
                    throw new Error(msg);
                }
                console.log(msg)
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setPasswordsMatch(null);
                setIsPasswordValid(true);
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
            } finally {
                setLoading(false);
            }
        }
    }

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

    return (
        <Fragment>
            {loading ? (
                <ProgressBar />
            ) : (
                <Fragment>
                    <Content textAlign={"center"}>
                        <Heading pt={5} spaced>Profile</Heading>
                    </Content>
                    <Container className="has-text-left is-max-desktop">
                        <Box>
                            {Object.keys(merchant).length === 0
                                ?
                                <Heading renderAs='h2' size={4}>Chyba načítání profilu, obnovte stránku.</Heading>
                                :
                                <Block>
                                    <Field>
                                        <Label htmlFor="inputIco">
                                            IČO
                                        </Label>
                                        <Control>
                                            <Input disabled value={merchant.ico} id="inputIco" type="text" placeholder="ICO" required />
                                            <Icon align="left"><FontAwesomeIcon icon={faUser} /></Icon>
                                        </Control>
                                    </Field>
                                    <hr />
                                    <form onSubmit={handleSubmitPasswordChange}>
                                        <Block>
                                            <Heading renderAs='h2' size={4}>Změna hesla</Heading>
                                            <Field>
                                                <Label htmlFor="inputCurrentPassword">
                                                    Současné heslo
                                                </Label>
                                                <Control>
                                                    <Input color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.currentPassword ? "danger" : undefined} name={"currentPassword"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} id="inputCurrentPassword" type="password" placeholder="*************" required />
                                                    <Icon color={postMsg && typeof postMsg.msg === "object" && postMsg.msg.currentPassword ? "danger" : undefined} align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                                </Control>
                                                {postMsg && typeof postMsg.msg === "object" && postMsg.msg.currentPassword && <Help color={'danger'}>{postMsg.msg.currentPassword}</Help>}
                                            </Field>
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
                                            <Button submit fullwidth color={'warning'}>Změnit heslo</Button>
                                        </Block>
                                        {postMsg && postMsg.msg && (
                                            <p className={postMsg.success ? "has-text-success" : "has-text-danger"}>
                                                {postMsg.msg instanceof Error ? postMsg.msg.message : typeof postMsg.msg === "string" && postMsg.msg}
                                            </p>
                                        )}
                                    </form>
                                </Block>
                            }
                        </Box>
                    </Container>
                </Fragment>
            )
            }
        </Fragment>
    )
}
