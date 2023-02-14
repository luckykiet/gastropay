import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Box, Columns, Content, Heading, Form, Icon, Button } from "react-bulma-components";
import React from "react";

export default function RegisterPage() {
    return (
        <React.Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Registrační formulář</Heading>
            </Content>
            <Columns pt={5} centered vCentered >
                <Columns.Column className="is-one-half-tablet is-one-third-widescreen">
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
        </React.Fragment>
    )
}