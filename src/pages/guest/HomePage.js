import packageJson from '../../../package.json';
const HomePage = () => {
    return (
        <>
            <div className="content is-vcentered has-text-centered">
                <h1 className="title is-spaced pt-5">{packageJson.app.name}</h1>
            </div>
            <div className="content">
                <h2 className="subtitle">Vítáme vás v aplikaci {packageJson.app.name}</h2>
                <p>Zde můžete pohodlně objednat jídlo bez obsluhy.</p>
                <p>Návod:</p>
                <ol>
                    <li>Zvolte si restauraci</li>
                    <li>Vložte si  pokrm do košíku</li>
                    <li>Zaplaťte svůj nákup</li>
                    <li>Zvolte stůl a počkejte na svoje jídlo</li>
                </ol>
            </div>

            <button className="button is-large is-primary is-fullwidth">
                Začni objednávat!
            </button>
        </>
    )
}

export default HomePage