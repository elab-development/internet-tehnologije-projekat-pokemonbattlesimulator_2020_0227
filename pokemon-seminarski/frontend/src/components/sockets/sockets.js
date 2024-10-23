import { io } from 'socket.io-client';

//const URL = 'http://localhost:5000'; neće jer cors smrdljivi

export const socket = io({
    autoConnect: false,
    reconnectionAttempts: 3,
    auth: (cb) => {
        //console.log(localStorage.getItem('token'))
        return cb({ token: localStorage.getItem('token') })
    }
});