import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Heading, Content, Container } from "react-bulma-components";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import 'bulma/css/bulma.min.css';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <>
            <header>
                <NavbarComponent />
            </header>
            <main>
                <Container breakpoint={'fluid'}>
                    <Heading>Výskytla se chyba!</Heading>
                    <Content>
                        <p>
                            <i><RootBoundary /></i>
                        </p>
                    </Content>
                </Container>
            </main>
            <FooterComponent />
        </>
    );
}

function RootBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return <>Chyba {error.status} - Tato stránka existuje!</>;
        }

        if (error.status === 401) {
            return <>Chyba {error.status} - Nemáte oprávnění!</>;
        }

        if (error.status === 503) {
            return <>Chyba {error.status} - Nepodařilo se načíst API!</>;
        }

        if (error.status === 418) {
            return <>🫖</>;
        }
    }

    return <>{error.statusText || error.message}</>;
}