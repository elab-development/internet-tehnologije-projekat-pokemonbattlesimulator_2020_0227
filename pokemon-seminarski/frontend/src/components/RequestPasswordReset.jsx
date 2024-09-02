import React, { useState } from 'react'
import API from './utils/API';
import { z } from 'zod'
import TypeWritter from './utils/TypeWritter';
import InputField from './utils/InputField';

const RequestPasswordReset = () => {
  const [successMessage, setSuccessMessage] = useState(false);
  const [email, setEmail] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!z.string().email().safeParse(email).success) {
      return;
    }

    setButtonPressed(true)
    API.post('/request-password-reset', {
      email: email
    }).then(() => {
      setSuccessMessage(true);
    }).catch((err) => {
      console.error('Unexpected error occured' + err);
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

        {successMessage ? <label className='auth-success-message'>Link to reset password is sent to your email!</label> : <input className="button" type="submit" value="request" disabled={buttonPressed} />}
      </form>
    </div>
  )
}

export default RequestPasswordReset