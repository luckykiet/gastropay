import packageJson from '../../../package.json';
import { Content, Heading, Button } from "react-bulma-components";
import { useNavigate } from "react-router-dom";
import { paths } from '../../utils';

export default function HomePage() {
    const navigate = useNavigate();

    const handleStartApp = () => {
        navigate(paths.RESTAURANTS);
    }
    return (
        <>
            <Content className="has-text-centered">
                <Heading size={1} className="pt-5" spaced>{packageJson.app.name}</Heading>
            </Content>
            <Content>
                <Heading size={3} subtitle>Vítáme vás v aplikaci {packageJson.app.name}</Heading>
                <p>Zde můžete pohodlně objednat jídlo bez obsluhy.</p>
                <p>Návod:</p>
                <ol>
                    <li>Zvolte si restauraci</li>
                    <li>Vložte si  pokrm do košíku</li>
                    <li>Zaplaťte svůj nákup</li>
                    <li>Zvolte stůl a počkejte na svoje jídlo</li>
                </ol>
            </Content>
            <Button size={'large'} color={'primary'} fullwidth onClick={handleStartApp}> Začněte objednávat!</Button>
        </>
    )
}