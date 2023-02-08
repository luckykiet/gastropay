import { Link } from "react-router-dom";
import packageJson from '../../package.json';
import { paths } from "../utils";
import { Footer, Content } from "react-bulma-components"
export default function FooterComponent() {
    return (
        <Footer className="has-background-white">
            <Content className="has-text-centered">
                <p>
                    Copyright ©&nbsp; {packageJson.app.provider}, <Link to={paths.HOME}> {packageJson.app.www}</Link>&nbsp;{new Date().getFullYear()}
                </p>
            </Content>
        </Footer>

    )
}