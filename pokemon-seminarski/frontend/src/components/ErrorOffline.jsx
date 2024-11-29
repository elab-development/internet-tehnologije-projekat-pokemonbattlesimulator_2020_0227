import React from 'react'
import { useAsyncError } from 'react-router-dom'

const ErrorOffline = () => {
    const error = useAsyncError();
    return (
        <div className='error-main'>
            <h1>There seems to be a problem with server, please try later</h1>
            <code><b>error:</b> {error.message}</code>
        </div>
    )
}

export default ErrorOffline