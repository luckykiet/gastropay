import { Link } from "react-router-dom";
import packageJson from '../../package.json';
import { PATHS } from '../config/paths';
import { Footer, Content } from "react-bulma-components"
export default function FooterComponent() {
    return (
        <Footer backgroundColor="white">
            <Content textAlign={"center"}>
                <p>
                    Copyright ©&nbsp; {packageJson.app.provider}, <Link to={PATHS.HOME}> {packageJson.app.name}</Link>&nbsp;{new Date().getFullYear()}
                </p>
            </Content>
        </Footer>
    )
}
