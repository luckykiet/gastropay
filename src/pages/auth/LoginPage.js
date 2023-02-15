import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../../utils";
import { Box, Columns, Container, Hero, Icon, Button, Form } from "react-bulma-components";

const { Body } = Hero;
const { Field, Label, Control, Input, Checkbox } = Form;
const { Column } = Columns;

export default function LoginPage() {
    const navigate = useNavigate();
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
                                <Field>
                                    <Label htmlFor="inputEmail">
                                        Email
                                    </Label>
                                    <Control>
                                        <Input id="inputEmail" type="email" placeholder="gastropay@vse.cz" required />
                                        <Icon align="left"><FontAwesomeIcon icon={faEnvelope} /></Icon>
                                    </Control>
                                </Field>
                                <Field>
                                    <Label htmlFor="inputPassword">
                                        Heslo
                                    </Label>
                                    <Control>
                                        <Input id="inputPassword" type="password" placeholder="*************" required />
                                        <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                                    </Control>
                                </Field>
                                <p className="py-2">Nemáte účet? <Link to={PATHS.REGISTRATION} className="is-underlined">Zaregistrujte</Link></p>
                                <p>Zapoměl(a) jste heslo? <Link to={PATHS.FORGOTTEN_PASS} className="is-underlined">Obnovte heslo</Link></p>
                                <Field py={2}>
                                    <Control>
                                        <Checkbox id="rememberMeCheckBox">&nbsp;Zapamatovat si</Checkbox>
                                    </Control>
                                </Field>
                                <Columns>
                                    <Column size={"half"}>
                                        <Button fullwidth color={'success'}>
                                            Přihlásit se
                                        </Button>
                                    </Column>
                                    <Column size={"half"}>
                                        <Button onClick={handleBackToApp} fullwidth color={'warning'}>
                                            Zpět do aplikace
                                        </Button>
                                    </Column>
                                </Columns>
                            </Box>
                        </Column>
                    </Columns>
                </Container>
            </Body>
        </Hero>
    )
}