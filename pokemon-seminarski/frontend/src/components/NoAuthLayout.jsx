import React, { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserContext } from '../contexts/UserContextProvider';

const NoAuthLayout = () => {
    const { info } = useContext(UserContext);

    if (info != null) {
        <Navigate to={'/home'} replace={true} />
    }

    return <Outlet />
}

export default NoAuthLayout