import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Box, Columns, Content, Heading, Form, Icon, Button } from "react-bulma-components";

export default function RegisterPage() {
    return (
        <>
            <Content className="has-text-centered">
                <Heading className="pt-5" spaced>Registrační formulář</Heading>
            </Content>
            <Columns className="pt-5" centered vCentered >
                <Columns.Column size={4} tablet={5} desktop={4} widescreen={4}>
                    <Box>
                        <Form.Field>
                            <Form.Label htmlFor="inputIco">
                                IČO
                            </Form.Label>
                            <Form.Control>
                                <Form.Input id="inputIco" type="text" placeholder="12345678" required />
                                <Icon align="left"><FontAwesomeIcon icon={faUser} /></Icon>
                            </Form.Control>
                        </Form.Field>
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
                        <Form.Field>
                            <Form.Label htmlFor="inputConfirmPassword">
                                Ověření hesla
                            </Form.Label>
                            <Form.Control>
                                <Form.Input id="inputConfirmPassword" type="password" placeholder="*************" required />
                                <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                            </Form.Control>
                        </Form.Field>
                        <Form.Field>
                            <Form.Control>
                                <Form.Checkbox id="agreementCheckBox">&nbsp;Souhlasíte s podmínky</Form.Checkbox>
                            </Form.Control>
                        </Form.Field>
                        <Button fullwidth color={'warning'}>Zaregistrovat se</Button>
                    </Box>
                </Columns.Column>
            </Columns>
        </>
    )
}