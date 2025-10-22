import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import API from './utils/api/API';
import useDebounce from './utils/useDebounce';
import { z } from 'zod'
import InputField from './utils/InputField';
import './css/NoAuth/RequestPassword.scss'

const ResetPassword = () => {
  const params = useParams();
  const [text, setText] = useState({ password: "", confirm: "" })
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);
  const [textError, setTextError] = useState({ password: false, confirm: false });
  const [_, setErrRerun] = useState(false);


  const debouncedText = useDebounce(text);

  useEffect(() => {
    let zerrors = [];
    let tempTextError = {}
    //check - password
    if (debouncedText.password) {
      let parseResult = z.string().min(5)
        .regex(/^(?=.*?[A-Z]).*$/, { message: 'At least one big letter' }) // Barem jedno Jedno veliko slovo
        .regex(/^(?=.*?[a-z]).*$/, { message: 'At least one small letter' }) // Barem jedno malo slovo
        .regex(/^(?=.*?[0-9]).*$/, { message: 'At least one number' }) // Barem jedan broj
        .regex(/^(?=.*?[#?!@$ %^&*-]).*$/, { message: 'At least one special character' }) //Barem jedan znak
        .safeParse(debouncedText.password);
      parseResult.error?.issues.forEach(val => zerrors.push("password - " + val.message));
      !parseResult.success && (tempTextError.password = true);
    }

    //check - confirm
    if (debouncedText.password && debouncedText.confirm && debouncedText.password !== debouncedText.confirm) {
      zerrors.push("confirm password - not matching");
      tempTextError.confirm = true;
    }

    if (zerrors.length > 0) {
      let m1 = zerrors[0].length > 67 ? zerrors[0].length.substring(0, 67) + "..." : zerrors[0];
      let message = m1 + zerrors.length > 1 && `. (${zerrors.length - 1} more error${zerrors.length - 1 > 1 ? "s" : ""})`
      setErrorMessage(message);
      //setTextError(tempTextError);
    }
  }, [debouncedText])


  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setText(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (textError.confirm || textError.password) {
      setErrorMessage('fields are incorrect');
      setErrRerun(prev => !prev);
      return
    }
    if (text.confirm === "" || text.password === "") {
      setErrorMessage("fields can't be empty");
      setErrRerun(prev => !prev);
      return;
    }

    setButtonPressed(true);
    console.log('/users/reset-password/' + params.id)
    API.patch('/users/reset-password/' + params.id, { password: text.password }).then((result) => {
      setSuccessMessage(true);
    }).catch((err) => {
      console.log(err);
      setErrorMessage(err.message?.length > 70 ? err.message.substring(0, 67) + "..." : err.message);
      setErrRerun(prev => !prev);
    }).finally(() => {
      setButtonPressed(false);
    })
  }

  return (
    <div className='reset-password-page'>
      <form onSubmit={handleSubmit}>

        <label htmlFor='password'>password</label>
        <InputField id="password" name="password" type='password' onChange={handleChange} value={text.password} autoFocus={true} valid={text.password ? textError.password : null} />

        <label htmlFor='confirm'>confirm password</label>
        <InputField id="confirm" name="confirm" type='password' onChange={handleChange} value={text.confirm} valid={text.confirm ? textError.confirm : null} />

        {successMessage ?
          <label className='auth-success-message'>Password is reset!</label> :
          <button className="button-full" type="submit" disabled={buttonPressed} >request reset</button>
        }
      </form>
      {errorMessage !== "" ? <label className='error'>{errorMessage}</label> : null}
    </div>
  )
}

export default ResetPassword