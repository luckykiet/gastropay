import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import { paths } from "../../utils";
const LoginPage = () => {
    return (
        <>
            <section className="hero is-primary is-fullheight">
                <div className="hero-body">
                    <div className="container">
                        <div className="columns is-centered">
                            <div className="column is-5-tablet is-4-desktop is-4-widescreen">
                                <form action="" className="box">
                                    <div className="field">
                                        <label for="inputEmail" className="label">Email</label>
                                        <div className="control has-icons-left">
                                            <input id="inputEmail" type="email" placeholder="gastropay@vse.cz" className="input" required />
                                            <span className="icon is-small is-left">
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label for="inputPassword" className="label">Heslo</label>
                                        <div className="control has-icons-left">
                                            <input id="inputPassword" type="password" placeholder="*******" className="input" required />
                                            <span className="icon is-small is-left">
                                                <FontAwesomeIcon icon={faLock} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <p>Nemáte účet? <Link to={paths.REGISTRATION} className="is-underlined">Zaregistrujte</Link></p>
                                    </div>
                                    <div className="field">
                                        <p>Zapoměl(a) jste heslo? <Link to={paths.FORGOTTEN_PASS} className="is-underlined">Obnovte heslo</Link></p>
                                    </div>
                                    <div className="field">
                                        <label for="rememberMeCheckBox" className="checkbox">
                                            <input id="rememberMeCheckBox" type="checkbox" />
                                            &nbsp;Zapamatovat si
                                        </label>
                                    </div>
                                    <div className="field">
                                        <button className="button is-success">
                                            Přihlásit se
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default LoginPage