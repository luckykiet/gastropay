import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Heading, Content, Container } from "react-bulma-components";
import NavbarComponent from "../components/NavbarComponent";
import FooterComponent from "../components/FooterComponent";
import 'bulma/css/bulma.min.css';
import React, { Fragment, useLayoutEffect } from "react";
import { CONFIG } from "../config/config";

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);
    useLayoutEffect(() => {
        document.title = `Chyba | ${CONFIG.APP_NAME}`;
    }, [])
    return (
        <Fragment>
            <header>
                <NavbarComponent />
            </header>
            <main>
                <Container breakpoint={'fluid'}>
                    <Heading pt={5}>Výskytla se chyba!</Heading>
                    <Content>
                        <p>
                            <i><RootBoundary /></i>
                        </p>
                    </Content>
                </Container>
            </main>
            <FooterComponent />
        </Fragment>
    );
}

function RootBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return <Fragment>Chyba {error.status} - Tato stránka existuje!</Fragment>;
        }

        if (error.status === 401) {
            return <Fragment>Chyba {error.status} - Nemáte oprávnění!</Fragment>;
        }

        if (error.status === 503) {
            return <Fragment>Chyba {error.status} - Nepodařilo se načíst API!</Fragment>;
        }

        if (error.status === 418) {
            return <Fragment>🫖</Fragment>;
        }
    }

    return <Fragment>{error.statusText || error.message}</Fragment>;
}