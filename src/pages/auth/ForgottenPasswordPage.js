import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Box, Columns, Content, Heading, Form, Icon, Button } from "react-bulma-components";
import React, { Fragment } from "react";
const { Column } = Columns;
const { Field, Label, Control, Input } = Form;
export default function ForgottenPasswordPage() {
    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Obnovit heslo</Heading>
            </Content>
            <Columns pt={5} centered vCentered >
                <Column size={4} tablet={5} desktop={4} widescreen={4}>
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
                        <Button fullwidth color={'warning'}>Obnovit heslo</Button>
                    </Box>
                </Column>
            </Columns>
        </Fragment>
    )
}