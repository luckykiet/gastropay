import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { createAxios, addSlashAfterUrl, API_URL, PATHS } from "../../utils";
import { Box, Columns, Container, Hero, Icon, Button, Form } from "react-bulma-components";
import { useState } from "react";
const { Body } = Hero;
const { Field, Label, Control, Input, Help } = Form;
const { Column } = Columns;

export default function LoginPage() {
    const [postMsg, setPostMsg] = useState('');
    const [email, setEmail] = useState('');
    const [isEmailValid, setIsEmailValid] = useState(null);
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { value } = e.target;
        setEmail(value);
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        setIsEmailValid(emailRegex.test(value) || value.length === 0);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (email === '' || !isEmailValid || password === '') {
            setPostMsg("Zkontrolujte vyplněné údaje!");
        } else {
            try {
                const axios = createAxios(addSlashAfterUrl(API_URL));
                const { data: { success, msg } } = await axios.post(
                    `${PATHS.API.AUTH}/${PATHS.API.LOGIN}`,
                    JSON.stringify({ email: email.toLowerCase(), password: password }), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (success) {
                    localStorage.setItem('token', msg.token);
                    navigate(PATHS.ROUTERS.MERCHANT);
                } else {
                    setPostMsg(msg);
                }
            } catch (err) {
                setPostMsg(err.response.data.msg);
            }
        }
    };

    const handleBackToApp = () => {
        navigate(PATHS.ROUTERS.HOME);
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
                                            <Input value={password} onChange={(event) => setPassword(event.target.value)} id="inputPassword" type="password" placeholder="*************" required />
                                            <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                                        </Control>
                                    </Field>
                                    <p className="py-2">Nemáte účet? <Link to={PATHS.ROUTERS.REGISTRATION} className="is-underlined">Zaregistrujte</Link></p>
                                    <p>Zapoměl(a) jste heslo? <Link to={PATHS.ROUTERS.FORGOTTEN_PASS} className="is-underlined">Obnovte heslo</Link></p>
                                    <Columns pt={4}>
                                        <Column size={"half"}>
                                            <Button submit fullwidth color={'success'}>
                                                Přihlásit se
                                            </Button>
                                        </Column>
                                        <Column size={"half"}>
                                            <Button onClick={handleBackToApp} fullwidth color={'warning'}>
                                                Zpět do aplikace
                                            </Button>
                                        </Column>
                                    </Columns>
                                </form>
                                {postMsg !== '' && <p className="has-text-danger">{postMsg}</p>}
                            </Box>
                        </Column>
                    </Columns>
                </Container>
            </Body>
        </Hero>
    )
}