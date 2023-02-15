import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Box, Columns, Content, Heading, Form, Icon, Button } from "react-bulma-components";
import React, { Fragment } from "react";

const { Field, Label, Control, Input, Checkbox } = Form;
const { Column } = Columns;

export default function RegisterPage() {
    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Registrační formulář</Heading>
            </Content>
            <Columns pt={5} centered vCentered >
                <Column className="is-one-half-tablet is-one-third-widescreen">
                    <Box>
                        <Field>
                            <Label htmlFor="inputIco">
                                IČO
                            </Label>
                            <Control>
                                <Input id="inputIco" type="text" placeholder="12345678" required />
                                <Icon align="left"><FontAwesomeIcon icon={faUser} /></Icon>
                            </Control>
                        </Field>
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
                        <Field>
                            <Label htmlFor="inputConfirmPassword">
                                Ověření hesla
                            </Label>
                            <Control>
                                <Input id="inputConfirmPassword" type="password" placeholder="*************" required />
                                <Icon align="left">  <FontAwesomeIcon icon={faLock} /></Icon>
                            </Control>
                        </Field>
                        <Field>
                            <Control>
                                <Checkbox id="agreementCheckBox">&nbsp;Souhlasíte s podmínky</Checkbox>
                            </Control>
                        </Field>
                        <Button fullwidth color={'warning'}>Zaregistrovat se</Button>
                    </Box>
                </Column>
            </Columns>
        </Fragment>
    )
}