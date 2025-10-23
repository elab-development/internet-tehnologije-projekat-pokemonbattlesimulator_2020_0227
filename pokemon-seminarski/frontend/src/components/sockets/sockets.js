import { io } from 'socket.io-client';


export const socket = io({
    autoConnect: false,
    reconnectionAttempts: 3,
    auth: (cb) => {
        return cb({ token: localStorage.getItem('token') })
    }
});