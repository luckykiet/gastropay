import packageJson from '../../../package.json';
import { Content, Heading, Button } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import React, { Fragment } from "react";
import { PATHS } from '../../config/paths';

export default function HomePage() {
    const navigate = useNavigate();

    return (
        <Fragment>
            <Content textAlign={'center'}>
                <Heading size={2} pt={5} spaced>{packageJson.app.name}</Heading>
            </Content>
            <Content>
                <Heading renderAs='h2' size={3} subtitle>Vítáme vás v aplikaci {packageJson.app.name}</Heading>
                <p>Zde můžete pohodlně objednat jídlo bez obsluhy.</p>
                <p>Návod:</p>
                <ol>
                    <li>Zvolte si restauraci</li>
                    <li>Vložte si pokrm do košíku</li>
                    <li>Zvolte si stůl</li>
                    <li>Zaplaťte svůj nákup</li>
                    <li>Počkejte na svoje jídlo</li>
                </ol>
            </Content>
            <Button size={'large'} color={'primary'} className='has-text-weight-bold' fullwidth onClick={() => navigate(PATHS.RESTAURANTS)}> Začněte objednávat!</Button>
        </Fragment >
    )
}