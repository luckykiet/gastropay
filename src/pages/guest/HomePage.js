import packageJson from '../../../package.json';
import { Content, Heading, Button } from "react-bulma-components";

export default function HomePage() {
    return (
        <>
            <Content className="has-text-centered">
                <Heading className="pt-5" spaced>{packageJson.app.name}</Heading>
            </Content>
            <Content>
                <Heading subtitle>Vítáme vás v aplikaci {packageJson.app.name}</Heading>
                <p>Zde můžete pohodlně objednat jídlo bez obsluhy.</p>
                <p>Návod:</p>
                <ol>
                    <li>Zvolte si restauraci</li>
                    <li>Vložte si  pokrm do košíku</li>
                    <li>Zaplaťte svůj nákup</li>
                    <li>Zvolte stůl a počkejte na svoje jídlo</li>
                </ol>
            </Content>
            <Button size={'large'} color={'primary'} fullwidth> Začněte objednávat!</Button>
        </>
    )
}