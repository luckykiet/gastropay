import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import { paths } from "../../utils";
import { Box, Columns, Container, Hero, Form, Icon, Button } from "react-bulma-components";
export default function LoginPage() {
    return (
        <Hero size={'fullheight'} color={'primary'}>
            <Hero.Body>
                <Container>
                    <Columns centered vCentered>
                        <Columns.Column size={4} tablet={5} desktop={4} widescreen={4}>
                            <Box>
                                <Form.Field>
                                    <Form.Label for="inputEmail">
                                        Email
                                    </Form.Label>
                                    <Form.Control>
                                        <Form.Input id="inputEmail" type="email" placeholder="gastropay@vse.cz" required />
                                        <Icon align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                                    </Form.Control>
                                </Form.Field>
                                <Form.Field>
                                    <Form.Label for="inputPassword">
                                        Heslo
                                    </Form.Label>
                                    <Form.Control>
                                        <Form.Input id="inputPassword" type="password" placeholder="*************" required />
                                        <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                                    </Form.Control>
                                </Form.Field>
                                <p>Nemáte účet? <Link to={paths.REGISTRATION} className="is-underlined">Zaregistrujte</Link></p>
                                <p>Zapoměl(a) jste heslo? <Link to={paths.FORGOTTEN_PASS} className="is-underlined">Obnovte heslo</Link></p>
                                <Form.Field>
                                    <Form.Control>
                                        <Form.Checkbox id="rememberMeCheckBox">&nbsp;Zapamatovat si</Form.Checkbox>
                                    </Form.Control>
                                </Form.Field>
                                <Button color={'success'}>
                                    Přihlásit se
                                </Button>
                            </Box>
                        </Columns.Column>
                    </Columns>
                </Container>
            </Hero.Body>
        </Hero>
    )
}