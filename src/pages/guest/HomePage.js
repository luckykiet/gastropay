import packageJson from '../../../package.json';
import { Content, Heading, Button } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { PATHS } from '../../utils';
import React, { Fragment } from "react";

export default function HomePage() {
    const navigate = useNavigate();

    const handleStartApp = () => {
        navigate(PATHS.RESTAURANTS);
    }
    return (
        <Fragment>
            <Content textAlign={'center'}>
                <Heading size={1} pt={5} spaced>{packageJson.app.name}</Heading>
            </Content>
            <Content>
                <Heading renderAs='h2' size={3} subtitle>Vítáme vás v aplikaci {packageJson.app.name}</Heading>
                <p>Zde můžete pohodlně objednat jídlo bez obsluhy.</p>
                <p>Návod:</p>
                <ol>
                    <li>Zvolte si restauraci</li>
                    <li>Vložte si  pokrm do košíku</li>
                    <li>Zaplaťte svůj nákup</li>
                    <li>Zvolte stůl a počkejte na svoje jídlo</li>
                </ol>
            </Content>
            <Button size={'large'} color={'primary'} fullwidth onClick={handleStartApp}> Začněte objednávat!</Button>
        </Fragment>
    )
}