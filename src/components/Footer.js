import { Link } from "react-router-dom";
import packageJson from '../../package.json';
import { paths } from "../utils";
export default function Footer() {
    return (
        <footer className="footer has-background-white">
            <div className="content has-text-centered">
                <p>
                    Copyright ©&nbsp; {packageJson.app.provider}, <Link to={paths.HOME}> {packageJson.app.www}</Link>&nbsp;{new Date().getFullYear()}
                </p>
            </div>
        </footer>
    )
}
