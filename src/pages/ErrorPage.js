import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorPage = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <>
            <h1 className="title">Oops!</h1>
            <p>
                <i><RootBoundary /></i>
            </p>
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

export default ErrorPage