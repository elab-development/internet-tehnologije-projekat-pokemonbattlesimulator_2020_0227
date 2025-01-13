import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { socket } from './sockets/sockets'
import { Outlet, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContextProvider';
import LoadingPage from './LoadingPage';
import { RootContext } from '../contexts/RootContextProvider';

const RootV2 = () => {
    const { setInfo, disconnectReason } = useContext(UserContext);
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
                console.log('attempting to reconnect after a login');
                setloadingState(true);
                socket.connect();
            }
        }
        cb?.call();
    }, []);

    useEffect(() => {
        function onConnectUser(data) { // Successfuly authorized and recived userData -> It's okay
            setInfo(prev => ({ ...prev, ...data.user }));
            setloadingState(false);
            if (redirect.current.onSuccess) {
                let temp = redirect.current.onSuccess;
                redirect.current.onSuccess = null;
                navigate(temp, { replace: true });
            }
        }

        function onConnectError(reason) { // Failed to connect
            if (socket.active) { // Is connectivity issue? -> Try again
                return;
            }

            setInfo(null); // Not authorized -> Delete Info
            setloadingState(false);

            if (redirect.current.onError != null) { // redirect to 
                let temp = redirect.current.onError;
                redirect.current.onError = null;
                navigate(temp, { replace: true, state: { error: reason.message } });
            }
        }

        function onDisconnect() { // Logged out forcefully -> Redirect to Welcome page
            console.log('disconnected');
            setInfo(null);
        }

        function onErrorNewConnection() {
            disconnectReason.current = "new_connection";
            console.error('new_connection')
            navigate('/', { replace: true })
        }

        function onReconnectFailed() { // Failed to connect cause server expiriences issues -> go to error
            //navigate('/error', { replace: true, state: { error: 'Failed to reconnect, please try later', reconnectButton: true } })
            //TODO
            //throw new Error("Failed to reconnect, refresh the page to try again");
            setInfo(null); // SETS INFO TO NULL AND REDIRECTS, THIS IS WRONG, SHOULD FIX LATER
            setloadingState(false);
        }

        socket.on('connect:user', onConnectUser)
        socket.on('disconnect:new:connection', onErrorNewConnection)
        socket.on('connect_error', onConnectError);
        socket.on('disconnect', onDisconnect);
        socket.io.on('reconnect_failed', onReconnectFailed);
        return () => {
            socket.off('connect:user', onConnectUser)
            socket.off('connect_error', onConnectError);
            socket.off('disconnect:new:connection', onErrorNewConnection)
            socket.off('disconnect', onDisconnect);
            socket.io.off('reconnect_failed', onReconnectFailed);
        }
    }, [redirect, setInfo, navigate, disconnectReason]);

    // Inital attempt at logging in
    useEffect(() => {
        console.log('runned once: check if logged in');
        socket.connect();
    }, []);

    /*useEffect(() => {
        const i = setInterval(() => console.log(socket.id, socket.connected), 500)

        return () => {
            clearInterval(i);
        }
    }, []);*/

    return (
        <RootContext.Provider value={{ notify }}>
            {loadingState ? <LoadingPage /> : <Outlet />}
        </RootContext.Provider>
    )
}

export default RootV2