import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Box, Columns, Content, Heading, Form, Icon, Button } from "react-bulma-components";
import React from "react";
export default function ForgottenPasswordPage() {
    return (
        <React.Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Obnovit heslo</Heading>
            </Content>
            <Columns pt={5} centered vCentered >
                <Columns.Column size={4} tablet={5} desktop={4} widescreen={4}>
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
                        <Button fullwidth color={'warning'}>Obnovit heslo</Button>
                    </Box>
                </Columns.Column>
            </Columns>
        </React.Fragment>
    )
}