import React, { useContext, useEffect, useState } from 'react'
import InputField from './utils/InputField';
import TypeWritter from './utils/TypeWritter';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from './utils/API';
import { socket } from './sockets/sockets';
import { RootContext } from '../contexts/RootContextProvider';

const Login = () => {
    const location = useLocation();
    const { notify } = useContext(RootContext);
    const [user, setUser] = useState({ email: "", username: "" });
    const [text, setText] = useState("");
    const [next, setNext] = useState(false);
    const [err, setErr] = useState(location.state.error ?? "");
    const [email, setEmail] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);

    useEffect(() => {
        window.history.replaceState({}, ''); // Clear state if any
    }, [])

    useEffect(() => {
        function onConnectError(error) {
            if (!socket.active) {
                setErr(error.message);
            }
        }
        socket.on('connect_error', onConnectError);
        return () => {
            socket.off('connect_error', onConnectError);
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!next) {
            setUser(prev => ({ ...prev, [email ? 'email' : 'username']: text }))
            setText('');
            setNext(true);
            return;
        }


        setButtonPressed(false);
        API.post('/login', {
            [email ? 'email' : 'username']: email ? user.email : user.username,
            password: text,
        }).then(res => {
            const data = res.data;
            //userRef.current = data; // Dobićemo svakako još jednom od soketa sve
            localStorage.setItem('token', 'Bearer ' + data.token);
            // socket.connect() // Should work since token is grabbed dynamicaly from storage
            notify({ options: { resetConnection: true, redirectTo: '/home' } }); // Successful login -> Refresh whole page
        }).catch(err => {
            setErr(err.response.data ?? err.message);
        }).finally(() => {
            setButtonPressed(false);
        })
    }

    const handleGoBack = (e) => {
        e.preventDefault();
        setText(email ? user.email : user.username);
        setNext(false);
    }

    const handleLoginPassClick = (e) => {
        e.preventDefault();
        if (next) {
            navigate('/reset-password', { replace: true });
        } else {
            setText(email ? user.username : user.email);
            setEmail(prev => !prev);
        }
    }

    const currentStage = () => {
        if (next) {
            if (email) {
                return 'email'
            }
            return 'password'
        }
        return 'username'
    }

    const handleChange = (e) => {
        const { value } = e.target;
        setText(value);
    }

    return ( 
        <div className='auth-login'>
            {!next && <h2 className='auth-title'>login</h2>}
            {next && <>{/* Neka sličica */}</>}

            <label className='auth-login-label' htmlFor='field' ><TypeWritter text={currentStage()} totalDuration={500} /></label>
            <InputField id='field' type={next ? 'password' : 'text'} value={text} onChange={handleChange} autoFocus={true} />
            <label onClick={handleLoginPassClick} className='auth-login-label pointer' >
                {next ? 'forgot password?' : (email ? 'use username to login?' : 'use email to login?')}
            </label>

            {next && <label>new here? <Link to='/register' replace={true}>register here!</Link></label>}
            {err !== "" && <label className='auth-login-label error' >{err}</label>}
            <div className='auth-login-button-wrapper'>
                {next && <button onClick={handleGoBack}>back</button>}
                <button onClick={handleSubmit} disabled={buttonPressed}>{next ? 'login' : 'next'}</button>
            </div>
        </div>
    )
}

export default Login