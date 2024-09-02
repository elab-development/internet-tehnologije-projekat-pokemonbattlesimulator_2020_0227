import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from '../contexts/UserContextProvider'

const AuthLayout = () => {
    const { info } = useContext(UserContext);

    if (info == null) {
        <Navigate to='/' replace={true} />
        return null;
    }

    return (
        <>
            <Outlet />
        </>
    )
}

export default AuthLayout