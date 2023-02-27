import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Box, Content, Heading, Form, Icon, Button, Container } from "react-bulma-components";
import React, { Fragment, useState, useEffect, useCallback } from "react";
import { checkICO, createAxios, API_URL, addSlashAfterUrl } from "../../utils";
import { Promise } from "bluebird";
import { useNavigate } from "react-router-dom";
import { PATHS } from '../../utils';

const { Field, Label, Control, Input, Checkbox, Help } = Form;

export default function RegisterPage() {
    const [postMsg, setPostMsg] = useState('');
    const [icoCheckMsg, setIcoCheckMsg] = useState('');
    const [emailCheckMsg, setEmailCheckMsg] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(true);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(true);
    const [passwordsMatch, setPasswordsMatch] = useState(null);
    const [formData, setFormData] = useState({
        ico: '',
        email: '',
        password: ''
    });
    const navigate = useNavigate();
    const { ico, email, password } = formData;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ico.length !== 8 || icoCheckMsg !== 'OK' || !isEmailValid || !passwordsMatch || !isPasswordValid || confirmPassword === '' || email === '' || password === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!")
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const { data: { success, msg } } = await axios.post(
                    `${PATHS.API.AUTH}/${PATHS.API.REGISTER}`,
                    JSON.stringify(formData), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (success) {
                    localStorage.setItem('token', msg.token);
                    navigate(PATHS.ROUTERS.DASHBOARD);
                } else {
                    setPostMsg(msg);
                }
            } catch (err) {
                setPostMsg(err.response.data.msg);
            }
        }
    }

    const handleConfirmPasswordChange = (e) => {
        const { value } = e.target;
        setConfirmPassword(value);
        setPasswordsMatch(!value || !password ? null : value === password);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'password') {
            setPasswordsMatch(!value || !confirmPassword ? null : value === confirmPassword);
            const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;
            setIsPasswordValid(passwordRegex.test(value) || value.length === 0);
        } else if (name === 'email') {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            setIsEmailValid(emailRegex.test(value) || value.length === 0);
        }
    }

    const checkEmailExist = useCallback(async () => {
        try {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            const { data: { success, msg } } = await axios.get(`api/${PATHS.API.AUTH}/check?email=${email}`);
            if (success) {
                setEmailCheckMsg(msg ? "Email je již používán!" : 'OK');
            } else {
                setEmailCheckMsg(msg);
            }

        } catch (err) {
            setEmailCheckMsg('');
            console.log(err);
        }
    }, [email]);

    const checkIcoExist = useCallback(async () => {
        try {
            const axios = createAxios(addSlashAfterUrl(API_URL));
            const { data: { success, msg } } = await axios.get(`api/${PATHS.API.AUTH}/check?ico=${ico}`);
            if (success) {
                setIcoCheckMsg(msg ? "IČO je již registrováno!" : 'OK');
            } else {
                setIcoCheckMsg(msg);
            }
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
            Promise.delay(0).then(checkIcoExist);
        }
    }, [ico, checkIcoExist]);

    useEffect(() => {
        if (email && isEmailValid) {
            Promise.delay(0).then(checkEmailExist);
            return;
        } else {
            setEmailCheckMsg('');
            return;
        }

    }, [email, isEmailValid, checkEmailExist]);

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
                                <Input color={icoCheckMsg !== '' ? (icoCheckMsg === "OK" ? "success" : "danger") : undefined} name={"ico"} value={ico} type={"text"} onChange={handleChange} id="inputIco" placeholder="12345678" required />
                                <Icon color={icoCheckMsg !== '' ? (icoCheckMsg === "OK" ? "success" : "danger") : undefined} align="left"><FontAwesomeIcon icon={faUser} /></Icon>
                                {icoCheckMsg === "OK" ? <Icon color={"success"} align="right"><FontAwesomeIcon icon={faCheck} /></Icon> : icoCheckMsg !== '' && <Help color={"danger"}>{icoCheckMsg}</Help>}
                            </Control>
                        </Field>
                        <Field>
                            <Label htmlFor="inputEmail">
                                Email
                            </Label>
                            <Control>
                                <Input color={emailCheckMsg === "OK" ? "success" : (emailCheckMsg !== '' || !isEmailValid) ? "danger" : undefined} name={"email"} value={email} onChange={handleChange} id="inputEmail" type={"email"} placeholder="gastropay@vse.cz" required />
                                <Icon color={emailCheckMsg === "OK" ? "success" : (emailCheckMsg !== '' || !isEmailValid) ? "danger" : undefined} align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                                {emailCheckMsg === "OK" ? <Icon color={"success"} align="right"><FontAwesomeIcon icon={faCheck} /></Icon> : !isEmailValid ? <Help color="danger">Nesprávný email formát</Help> : emailCheckMsg !== '' && <Help color={"danger"}>{emailCheckMsg}</Help>}
                            </Control>
                        </Field>
                        <Field>
                            <Label htmlFor="inputPassword">
                                Heslo
                            </Label>
                            <Control>
                                <Input name={"password"} color={isPasswordValid ? null : "danger"} value={password} onChange={handleChange} id="inputPassword" type="password" placeholder="*************" required />
                                <Icon align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                {!isPasswordValid && <Help color="danger">Heslo musí obsahovat alespoň 8 znaků, 1 velké, 1 malé písmeno a 1 číslici</Help>}
                            </Control>
                        </Field>
                        <Field>
                            <Label htmlFor="inputConfirmPassword">
                                Ověření hesla
                            </Label>
                            <Control>
                                <Input color={passwordsMatch !== null ? (passwordsMatch ? "success" : "danger") : undefined} name={"confirmPassword"} value={confirmPassword} onChange={handleConfirmPasswordChange} id="inputConfirmPassword" type="password" placeholder="*************" required />
                                <Icon color={passwordsMatch !== null ? (passwordsMatch ? "success" : "danger") : undefined} align="left"><FontAwesomeIcon icon={faLock} /></Icon>
                                {passwordsMatch !== null ? (passwordsMatch ? <Icon color={"success"} align="right"><FontAwesomeIcon icon={faCheck} /></Icon> : <Help color={"danger"}>Hesla neshodují!</Help>) : ""}
                            </Control>
                        </Field>
                        <Field>
                            <Control>
                                <Checkbox required id="agreementCheckBox">&nbsp;Souhlasíte s podmínky</Checkbox>
                            </Control>
                        </Field>
                        <Button submit fullwidth color={'warning'}>Zaregistrovat se</Button>
                    </form>
                    {postMsg !== '' && <p className="has-text-danger">{postMsg}</p>}
                </Box>
            </Container>
        </Fragment>
    )
}