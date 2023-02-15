import React from 'react'
import { Columns, Button } from 'react-bulma-components'

export default function LoadingComponent() {
    return (
        <Columns centered vCentered>
            <Button className="is-loading" size={"large"} color="white" />
        </Columns>
    )
}
