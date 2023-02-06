import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
const ForgottenPasswordPage = () => {
    return (
        <>
            <div className="content is-vcentered has-text-centered">
                <h1 className="title is-spaced pt-5">Obnovit heslo</h1>
            </div>
            <div className="columns is-centered pt-5">
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
                            <button className="button is-warning is-fullwidth">
                                Obnovit heslo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default ForgottenPasswordPage