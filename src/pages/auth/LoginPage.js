import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { paths } from "../../utils";
import { Box, Columns, Container, Hero, Form, Icon, Button } from "react-bulma-components";
export default function LoginPage() {
    const navigate = useNavigate();
    const handleBackToApp = () => {
        navigate(paths.HOME);
    }
    return (
        <Hero size={'fullheight'} color={'primary'}>
            <Hero.Body>
                <Container>
                    <Columns centered vCentered>
                        <Columns.Column className="is-one-half-tablet is-one-third-widescreen">
                            <Box>
                                <Form.Field>
                                    <Form.Label htmlFor="inputEmail">
                                        Email
                                    </Form.Label>
                                    <Form.Control>
                                        <Form.Input id="inputEmail" type="email" placeholder="gastropay@vse.cz" required />
                                        <Icon align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                                    </Form.Control>
                                </Form.Field>
                                <Form.Field>
                                    <Form.Label htmlFor="inputPassword">
                                        Heslo
                                    </Form.Label>
                                    <Form.Control>
                                        <Form.Input id="inputPassword" type="password" placeholder="*************" required />
                                        <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                                    </Form.Control>
                                </Form.Field>
                                <p className="py-2">Nemáte účet? <Link to={paths.REGISTRATION} className="is-underlined">Zaregistrujte</Link></p>
                                <p>Zapoměl(a) jste heslo? <Link to={paths.FORGOTTEN_PASS} className="is-underlined">Obnovte heslo</Link></p>
                                <Form.Field py={2}>
                                    <Form.Control>
                                        <Form.Checkbox id="rememberMeCheckBox">&nbsp;Zapamatovat si</Form.Checkbox>
                                    </Form.Control>
                                </Form.Field>
                                <Columns>
                                    <Columns.Column size={"half"}>
                                        <Button fullwidth color={'success'}>
                                            Přihlásit se
                                        </Button>
                                    </Columns.Column>
                                    <Columns.Column size={"half"}>
                                        <Button onClick={handleBackToApp} fullwidth color={'warning'}>
                                            Zpět do aplikace
                                        </Button>
                                    </Columns.Column>
                                </Columns>

                            </Box>
                        </Columns.Column>
                    </Columns>
                </Container>
            </Hero.Body>
        </Hero>
    )
}