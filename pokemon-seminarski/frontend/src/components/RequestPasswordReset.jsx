import React, { useState } from 'react'
import API from './utils/api/API';
import { z } from 'zod'
import TypeWritter from './utils/TypeWritter';
import InputField from './utils/InputField';
import './css/NoAuth/RequestPasswordReset.scss'
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RequestPasswordReset = () => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);
  const [err, setErr] = useState("");
  const [errRerun, setErrRerun] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");
    if (!z.string().email().safeParse(email).success) {
      setErr("incorrect email format");
      setErrRerun(prev => !prev);
      return;
    }

    setButtonPressed(true)
    API.post('/users/request-password-reset', {
      email: email
    }).then(() => {
      setSuccessMessage(true);
      setTimeout(() => {
        navigate('/');
      }, 2000)
    }).catch((err) => {
      let errorMessage = String('Unexpected error occured' + err);
      console.error('Unexpected error occured' + err);
      setErr(errorMessage.length > 70 ? errorMessage.substring(0,67) + "..." : errorMessage);
    }).finally(() => {
      setButtonPressed(false);
    });
  }

  const handleChange = (e) => {
    e.preventDefault();
    const text = e.target.value;
    setEmail(text);
  }

  return (
    <div className='auth-request-password-reset'>
      <h2 className='auth-title'>request password reset</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor='email'><TypeWritter text='email' /></label>
        <InputField id="email" name="email" type='email' onChange={handleChange} value={email} autoFocus={true} />

        {successMessage ?
          <label className='auth-success-message'>Link to reset password is sent to your email!</label> :
          <button className="button-full" type="submit" disabled={buttonPressed} >request reset</button>}
      </form>
      <AnimatePresence mode='wait'>
        {err !== "" && <motion.label
          key={errRerun}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className='error' >{err}</motion.label>
        }
      </AnimatePresence>
    </div>
  )
}

export default RequestPasswordReset