import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from '../contexts/UserContextProvider'
import { socket } from './sockets/sockets';

const AuthLayout = () => {
    const { info } = useContext(UserContext);

    console.log(info);
    if (info == null || info.id == null || socket.disconnected) {
        console.log('redirect to welcome page');
        return <Navigate to='/' replace={true} />
    }

    return (
        <>
            <Outlet />
        </>
    )
}

export default AuthLayout