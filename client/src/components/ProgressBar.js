import React from 'react'
import { Progress } from 'react-bulma-components'
export default function ProgressBar() {
    return (
        <Progress
            size={'small'}
            max={100}
            className='is-primary'
        />
    )
}
