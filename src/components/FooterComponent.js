import { Link } from "react-router-dom";
import packageJson from '../../package.json';
import config from "../config/config";
import { Footer, Content } from "react-bulma-components"
export default function FooterComponent() {
    return (
        <Footer backgroundColor="white">
            <Content textAlign={"center"}>
                <p>
                    Copyright ©&nbsp; {packageJson.app.provider}, <Link to={config.PATHS.ROUTERS.HOME}> {packageJson.app.www}</Link>&nbsp;{new Date().getFullYear()}
                </p>
            </Content>
        </Footer>
    )
}
