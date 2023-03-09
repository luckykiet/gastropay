import React from 'react'
import { Button, Container } from 'react-bulma-components'

export default function LoadingComponent() {
    return (
        <Container breakpoint={'fluid'} pt={5} className='has-text-centered'>
            <Button className="is-loading" size={"large"} color="white" />
        </Container>
    )
}
