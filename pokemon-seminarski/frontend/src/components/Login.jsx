import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import InputField from './utils/InputField';
import TypeWritter from './utils/TypeWritter';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from './utils/API';
import { socket } from './sockets/sockets';
import { RootContext } from '../contexts/RootContextProvider';
import { AnimatePresence, motion } from 'framer-motion'
import './css/NoAuth/Login.scss';
import './css/Util/Buttons.scss';
import catexplode from './assets/general/cat-explosion.gif'

const Login = () => {
    const location = useLocation();
    const { notify } = useContext(RootContext);
    const [user, setUser] = useState({ username: "" });
    const [text, setText] = useState("");
    const [next, setNext] = useState(false);
    const [err, setErr] = useState(location.state?.error ?? "");
    const [errRerun, setErrRerun] = useState(false); // state to trigger a err component to remount again and display an animation
    const [buttonPressed, setButtonPressed] = useState(false);
    const inputRef = useRef(null);

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
    }, []);

    useLayoutEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [next]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!next) {
            if (text.trim() === "") { // NO TEXT PROVIDED CAN'T GO NEXT
                setErr('field must contain some text')
                return;
            }
            setUser({ username: text })
            setText('');
            setNext(true);
            setErr("");
            return;
        }

        if (text === "") {
            setErr('field must contain some text')
            return;
        }
        setButtonPressed(true);
        API.post('/users/login', {
            username: user.username,
            password: text.trim(),
        }).then(res => {
            const data = res.data;
            localStorage.setItem('token', 'Bearer ' + data.token);
            notify({ options: { resetConnection: true, redirectTo: '/home' } }); // Successful login -> Refresh whole page
        }).catch(err => {
            setErrRerun(prev => !prev);
            console.log(err);
            console.log(err.response);
            console.log(err.response?.data);


            setErr(err.response?.data?.message ?? 'Something went wrong!\nServer is probably offline, try again later');
        }).finally(() => {
            setButtonPressed(false);
        })
    }

    const handleGoBack = (e) => {
        e.preventDefault();
        setText(user.username);
        setNext(false);
        setErr('')
    }

    const currentStage = () => {
        if (next) {
            return 'password'
        }
        return 'username'
    }

    const handleChange = (e) => {
        const { value } = e.target;
        setText(value);
    }

    return (
        <AnimatePresence mode='wait'>
            <div className='auth-login'>
                {!next &&
                    <motion.h2
                        key='title-uniq'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className='auth-title'
                    >
                        login
                    </motion.h2>}
                {next && <motion.img
                    key='fani-img'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className='fanni-pic'
                    src={catexplode} alt=''
                />}

                <label key='field-name ' className={'auth-login-label' + (next ? ' password-stage' : ' username-stage')} htmlFor='field' ><TypeWritter text={currentStage()} totalDuration={500} /></label>

                <form onSubmit={handleSubmit}>
                    <div key='input-wrapper' className={'auth-login-input-text-wrapper' + (next ? ' password-stage' : '')}>
                        <InputField id='field' key='input-field' type={next ? 'password' : 'text'} value={text} onChange={handleChange} autoComplete="off" passRef={inputRef} />
                    </div>

                    <div key='next-wrapper' className={'auth-login-button-wrapper-main' + (next ? ' password-stage' : ' username-stage')}>
                        <button key='next' type="submit" className={'button-full' + (next ? ' button-half' : '')} disabled={buttonPressed}>{next ? 'login' : 'next'}</button>
                    </div>
                </form>

                {err !== "" && <motion.label
                    key={'login-error ' + errRerun}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className={'auth-login-label error' + (next ? ' password-stage-error' : ' ')} >{err}</motion.label>
                }

                {next && <motion.label
                    key='register-here'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.1 }}
                    className='auth-login-label register-now-login'
                >
                    new here? <Link to='/register' replace={true}>register now!</Link>
                </motion.label>
                }
                {!next ? null :
                    <motion.label
                        key='forgot-pass'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1, delay: 0.2 }}
                        className='auth-login-label forgot-pass'
                    >
                        <Link to='/request-password-reset' replace={true}>forgot password?</Link>
                    </motion.label>
                }
                {next &&
                    <div key='go-back-wrapper' className='auth-login-button-wrapper-back'>
                        <motion.button
                            key='go-back'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className='button-full button-half'
                            onClick={handleGoBack}
                        >back
                        </motion.button>
                    </div>
                }

            </div >
        </AnimatePresence>
    )
}

export default Login