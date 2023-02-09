import { Content, Heading } from "react-bulma-components";
import packageJson from '../../../package.json';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser, faSchool } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
export default function ContactPage() {
    return (
        <>
            <Heading pt={5}>Kontaktní údaje</Heading>
            <Content>
                <p><FontAwesomeIcon icon={faUser} /> Autor: Tuan Kiet Nguyen</p>
                <p><FontAwesomeIcon icon={faSchool} /> Email školní: <a href="mailto:ngut62@vse.cz">ngut62@vse.cz</a></p>
                <p><FontAwesomeIcon icon={faEnvelope} /> Email osobní: <a href="mailto:ngntuankiet@gmail.com">ngntuankiet@gmail.com</a></p>
                <p><FontAwesomeIcon icon={faGithub} /> Github: <a href="https://github.com/luckykiet/gastropay" target="_blank" rel="noopener noreferrer">{packageJson.app.name}</a></p>
            </Content>
        </>
    )
}
