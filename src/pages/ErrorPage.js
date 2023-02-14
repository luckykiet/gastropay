import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Heading, Content, Container } from "react-bulma-components";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import 'bulma/css/bulma.min.css';
import React from "react";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <React.Fragment>
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
        </React.Fragment>
    );
}

function RootBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return <React.Fragment>Chyba {error.status} - Tato stránka existuje!</React.Fragment>;
        }

        if (error.status === 401) {
            return <React.Fragment>Chyba {error.status} - Nemáte oprávnění!</React.Fragment>;
        }

        if (error.status === 503) {
            return <React.Fragment>Chyba {error.status} - Nepodařilo se načíst API!</React.Fragment>;
        }

        if (error.status === 418) {
            return <React.Fragment>🫖</React.Fragment>;
        }
    }

    return <React.Fragment>{error.statusText || error.message}</React.Fragment>;
}