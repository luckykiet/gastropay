import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
const RegisterPage = () => {
    return (
        <>
            <div className="content is-vcentered has-text-centered">
                <h1 className="title is-spaced pt-5">Registrační formulář</h1>
            </div>
            <div className="columns is-centered pt-5">
                <div className="column is-5-tablet is-4-desktop is-4-widescreen">
                    <form action="" className="box">
                        <div className="field">
                            <label for="inputICO" className="label">IČO</label>
                            <div className="control has-icons-left">
                                <input id="inputICO" type="text" placeholder="12345678" className="input" required />
                                <span className="icon is-small is-left">
                                    <FontAwesomeIcon icon={faUser} />
                                </span>
                            </div>
                        </div>
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
                            <label for="inputConfirmPassword" className="label">Ověřit heslo</label>
                            <div className="control has-icons-left">
                                <input id="inputConfirmPassword" type="password" placeholder="*******" className="input" required />
                                <span className="icon is-small is-left">
                                    <FontAwesomeIcon icon={faLock} />
                                </span>
                            </div>
                        </div>
                        <div className="field">
                            <label for="agreementCheckBox" className="checkbox">
                                <input id="agreementCheckBox" type="checkbox" />
                                &nbsp;Souhlasíte s podmínky
                            </label>
                        </div>
                        <div className="field">
                            <button className="button is-warning is-fullwidth">
                                Zaregistrovat se
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default RegisterPage