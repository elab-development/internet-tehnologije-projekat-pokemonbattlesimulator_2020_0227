import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from '../contexts/UserContextProvider';
import { socket } from './sockets/sockets';

const NoAuthLayout = () => {
    const { info } = useContext(UserContext);

    
    if (socket.connected || info != null) {
        console.log('navigate to auth ')
        console.log(socket.connected, info);
        return <Navigate to={'/home'} replace={true} />
    }

    return <Outlet />
}

export default NoAuthLayout