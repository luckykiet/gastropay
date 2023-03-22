import { Content, Heading } from "react-bulma-components";
import React, { Fragment, useLayoutEffect } from "react";
import packageJson from '../../../package.json';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser, faSchool } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { CONFIG } from "../../config/config";

export default function ContactPage() {
    useLayoutEffect(() => {
        document.title = `Kontakty | ${CONFIG.APP_NAME}`;
    }, [])

    return (
        <Fragment>
            <Heading pt={5}>Kontaktní údaje</Heading>
            <Content>
                <p><span className={'alignAfterIcon'}><FontAwesomeIcon icon={faUser} /></span><span>Autor: Tuan Kiet Nguyen</span></p>
                <p><span className={'alignAfterIcon'}><FontAwesomeIcon icon={faSchool} /></span><span>Email školní: <a href="mailto:ngut62@vse.cz">ngut62@vse.cz</a></span></p>
                <p><span className={'alignAfterIcon'}><FontAwesomeIcon icon={faEnvelope} /></span><span>Email osobní: <a href="mailto:ngntuankiet@gmail.com">ngntuankiet@gmail.com</a></span></p>
                <p><span className={'alignAfterIcon'}><FontAwesomeIcon icon={faGithub} /></span><span>Github: <a href="https://github.com/luckykiet/gastropay" target="_blank" rel="noopener noreferrer">{packageJson.app.name}</a></span></p>
            </Content>
        </Fragment>
    )
}
