import React, { Fragment } from 'react';
import { Content, Heading, Container, Box } from 'react-bulma-components';

export default function TransactionPage() {
    return (
        <Fragment>
            <Content textAlign={"center"}>
                <Heading pt={5} spaced>Transakce</Heading>
            </Content>
            <Container className="has-text-centered is-max-desktop">
                <Box>

                </Box>
            </Container>
        </Fragment>
    )
}
