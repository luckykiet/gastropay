import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createAxios, addSlashAfterUrl } from "../../utils";
import { Box, Columns, Container, Hero, Icon, Button, Form } from "react-bulma-components";
import { useState, useEffect } from "react";
import { PATHS } from '../../config/paths';
import { CONFIG } from '../../config/config';
import { API } from '../../config/api';
const { Body } = Hero;
const { Field, Label, Control, Input, Help } = Form;
const { Column } = Columns;

export default function LoginPage() {
    const [postMsg, setPostMsg] = useState('');
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.title = `Přihlášení | ${CONFIG.APP_NAME}`;
    }, [location])

    const handleChange = (e) => {
        const { value } = e.target;
        setEmail(value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsEmailValid(emailRegex.test(value) || value.length === 0);
        setPostMsg('');
    }

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setPostMsg('');
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPostMsg('')
        setIsLoading(true);
        if (email === '' || !isEmailValid || password === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(CONFIG.API_URL));
                const { data: { success, msg } } = await axios.post(
                    `${API.AUTH}/${API.LOGIN}`,
                    JSON.stringify({ email: email.toLowerCase(), password: password }), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!success) {
                    throw new Error(msg);
                }
                localStorage.setItem('token', msg.token);
                navigate(PATHS.MERCHANT);
            } catch (err) {
                setPostMsg(err.response?.data.msg ? err.response.data.msg : err);
            }
        }
        setIsLoading(false);
    };

    const handleBackToApp = () => {
        navigate(PATHS.HOME);
    }

    return (
        <Hero size={'fullheight'} color={'primary'}>
            <Body>
                <Container>
                    <Columns centered vCentered>
                        <Column className="is-one-half-tablet is-one-third-widescreen">
                            <Box>
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
                                    <Field>
                                        <Label htmlFor="inputPassword">
                                            Heslo
                                        </Label>
                                        <Control>
                                            <Input value={password} onChange={(event) => handlePasswordChange(event)} id="inputPassword" type="password" placeholder="*************" required />
                                            <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                                        </Control>
                                    </Field>
                                    <p className="py-2">Nemáte účet? <Link to={PATHS.REGISTRATION} className="is-underlined">Zaregistrujte</Link></p>
                                    <p>Zapoměl(a) jste heslo? <Link to={PATHS.FORGOTTEN_PASS} className="is-underlined">Obnovte heslo</Link></p>
                                    <Columns pt={4}>
                                        <Column size={"half"}>
                                            {isLoading ?
                                                <Button disabled fullwidth color={'success'} className="is-loading" />
                                                :
                                                <Button submit fullwidth color={'success'}>
                                                    Přihlásit se
                                                </Button>
                                            }
                                        </Column>
                                        <Column size={"half"}>
                                            <Button onClick={handleBackToApp} fullwidth color={'warning'}>
                                                Zpět do aplikace
                                            </Button>
                                        </Column>
                                    </Columns>
                                </form>
                                {postMsg && (<p className="has-text-danger">{postMsg instanceof Error ? postMsg.message : postMsg}</p>)}
                            </Box>
                        </Column>
                    </Columns>
                </Container>
            </Body>
        </Hero>
    )
}