import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { socket } from './sockets/sockets'
import { Outlet, replace, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContextProvider';
import LoadingPage from './LoadingPage';
import { RootContext } from '../contexts/RootContextProvider';

const RootV2 = () => {
    const { setUser } = useContext(UserContext);
    const [loadingState, setloadingState] = useState(true);
    const redirect = useRef({ onSuccess: null, onError: null });
    const navigate = useNavigate();

    /**@type {import('../contexts/RootContextProvider').T_RootNotify} */
    const notify = useCallback(({ options = { resetConnection: false, redirectTo: null, errorRedirectTo: null }, cb }) => {
        if (options) {
            if (options.redirectTo) {
                redirect.current.onSuccess = options.redirectTo;
            }
            if (options.errorRedirectTo) {
                redirect.current.onError = options.errorRedirectTo;
            }

            if (options.resetConnection) {
                setloadingState(true);
                socket.connect();
            }
        }
        cb?.call();
    }, []);

    useEffect(() => {
        function onConnectUser(data) { // Successfuly authorized and recived userData -> It's okay
            setUser(prev => ({ ...prev, info: data.user }));
            setloadingState(false);
            if (redirect.current.onSuccess) {
                let temp = redirect.current.onSuccess;
                redirect.current.onSuccess = null;
                navigate(temp, { replace: true });
            }
        }

        function onConnectError(reason) { // Failed to authorize -> It's okay
            console.error(reason.message);
            if (socket.active) {
                return;
            }

            setUser({ info: null, token: "" });
            setloadingState(false);

            if (errorRedirectTo != null) { // redirect to 
                let temp = redirect.current.onError;
                redirect.current.onError = null;
                navigate(temp, { replace: true, state: { error: reason.message } });
            }
        }

        function onDisconnect() { // Logged out forcefully -> Redirect to Welcome page
            setUser({ info: null, token: "" });
        }

        socket.on('connect:user', onConnectUser)
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);

        return () => {
            socket.off('connect:user', onConnectUser)
            socket.off('connect_error', onConnectError);
            socket.off('disconnect', onDisconnect);
        }
    }, []);

    // Inital attempt at logging in
    useEffect(() => {
        socket.connect();
    }, []);

    return (
        <RootContext.Provider value={{ notify }}>
            {loadingState ? <LoadingPage /> : <Outlet />}
        </RootContext.Provider>
    )
}

export default RootV2