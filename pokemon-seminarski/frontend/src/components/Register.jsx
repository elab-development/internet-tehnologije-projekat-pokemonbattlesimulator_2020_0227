import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContextProvider';
import { z } from 'zod'
import InputField from './utils/InputField';
import TypeWritter from './utils/TypeWritter';
import useDebounce from './utils/useDebounce';
import API from './utils/API';
import { socket } from './sockets/sockets';

const Register = () => {
  const [user, setUser] = useState({ email: "", username: "", password: "", confirm: "" });
  const [userError, setUserError] = useState({ email: false, username: false, password: false, confirm: false });
  const [err, setErr] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);

  const debouncedUser = useDebounce(user);

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

  useEffect(() => {
    let zerrors = [];
    let tempUserError = {}
    //check - email
    if (user.email) {
      let parseResult = z.string().email().optional().safeParse(user.email);
      parseResult.error?.issues.forEach(val => zerrors.push("email - " + val.message));
      !parseResult.success && (tempUserError.email = true);
    }

    //check - username
    if (user.username) {
      let parseResult = z.string().min(3).max(15)
        .regex(/^(?![_]).*(?<![_])$/, { message: "Can't begin or end with underscore" })
        .regex(/^(?!.*[_]{2}).*$/, { message: "Can't have two underscores in succesion" })
        .regex(/^[a-zA-Z0-9_]+$/, { message: "Only alphanumerical values " })
        .safeParse(user.username)
      parseResult.error?.issues.forEach(val => zerrors.push("username - " + val.message))
      !parseResult.success && (tempUserError.username = true);
    }

    //check - password
    if (user.password) {
      let parseResult = z.string().min(5)
        .regex(/^(?=.*?[A-Z]).*$/, { message: 'At least one big letter' }) // Barem jedno Jedno veliko slovo
        .regex(/^(?=.*?[a-z]).*$/, { message: 'At least one small letter' }) // Barem jedno malo slovo
        .regex(/^(?=.*?[0-9]).*$/, { message: 'At least one number' }) // Barem jedan broj
        .regex(/^(?=.*?[#?!@$ %^&*-]).*$/, { message: 'At least one special character' }) //Barem jedan znak
        .safeParse(user.password);
      parseResult.error?.issues.forEach(val => zerrors.push("password - " + val.message));
      !parseResult.success && (tempUserError.password = true);

    }

    //check - confirm
    if (user.password && user.confirm && user.password !== user.confirm) {
      zerrors.push("confirm password - not matching");
      tempUserError.confirm = true;
    }

    if (zerrors.length > 0) {
      setErr(zerrors[0] + zerrors.length > 1 && `. (${zerrors.length - 1} more error${zerrors.length - 1 > 1 ? "s" : ""})`);
      setUserError(tempUserError);
    }
  }, [debouncedUser])


  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonPressed(true);
    API.post('/register', { email: user.email, username: user.username, password: user.password }).then((result) => {
      const data = result.data;
      localStorage.setItem('token', data.token);
      socket.connect();
    }).catch((err) => {
      setErr(err.message);
    }).finally(() => {
      setButtonPressed(false);
    });
  }

  return (
    <div className='auth-register'>
      <h2 className='auth-title'>register</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor='email'><TypeWritter text='email' /></label>
        <InputField id="email" name="email" type='email' onChange={handleChange} value={user.email} autoFocus={true} valid={user.email ? userError.email : null} />

        <label htmlFor='username'><TypeWritter text='username' initialDelay={20} /></label>
        <InputField id="username" name="username" onChange={handleChange} value={user.username} valid={user.username ? userError.username : null} />

        <label htmlFor='password'><TypeWritter text='password' initialDelay={40} /></label>
        <InputField id="password" type='password' name="password" onChange={handleChange} value={user.password} valid={user.password ? userError.password : null} />

        <label htmlFor='confirmPassword'><TypeWritter text='confirm password' initialDelay={60} /></label>
        <InputField id="confirmPassword" type='password' name="confirmPassword" onChange={handleChange} value={user.confirm} valid={user.confirm ? userError.confirm : null} />

        <label>already have an account? <Link to='/login' replace={true}>login here</Link></label>
        {err !== "" && <label className='auth-login-label error' htmlFor='field' >{err}</label>}
        <input className="button" type="submit" value="register" disabled={user.confirm && user.email && user.password && user.username && userError.confirm && userError.email && userError.password && userError.username && buttonPressed} />
      </form>
    </div>
  )
}

export default Register