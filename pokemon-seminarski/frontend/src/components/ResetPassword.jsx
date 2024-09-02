import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import API from './utils/API';
import useDebounce from './utils/useDebounce';

const ResetPassword = () => {
  const params = useParams();
  const [text, setText] = useState({ password: "", confirm: "" })
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [buttonPressed, setButtonPressed] = useState(false);
  const [textError, setTextError] = useState({password: false, confirm: false});

  const debouncedText = useDebounce(text);

  useEffect(() => {
    let zerrors = [];
    let tempTextError = {}
    //check - password
    if (text.password) {
      let parseResult = z.string().min(5)
        .regex(/^(?=.*?[A-Z]).*$/, { message: 'At least one big letter' }) // Barem jedno Jedno veliko slovo
        .regex(/^(?=.*?[a-z]).*$/, { message: 'At least one small letter' }) // Barem jedno malo slovo
        .regex(/^(?=.*?[0-9]).*$/, { message: 'At least one number' }) // Barem jedan broj
        .regex(/^(?=.*?[#?!@$ %^&*-]).*$/, { message: 'At least one special character' }) //Barem jedan znak
        .safeParse(text.password);
      parseResult.error?.issues.forEach(val => zerrors.push("password - " + val.message));
      !parseResult.success && (tempTextError.password = true);

    }

    //check - confirm
    if (text.password && text.confirm && text.password !== text.confirm) {
      zerrors.push("confirm password - not matching");
      tempTextError.confirm = true;
    }

    if (zerrors.length > 0) {
      setErrorMessage(zerrors[0] + zerrors.length > 1 && `. (${zerrors.length - 1} more error${zerrors.length - 1 > 1 ? "s" : ""})`);
      setTextError(tempTextError);
    }
  }, [debouncedText])


  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setText(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setButtonPressed(true);
    API.post('/reset-password/' + params.id, { password: text.password }).then((result) => {
      setSuccessMessage(true);
    }).catch((err) => {
      setErrorMessage(err.message);
    }).finally(() => {
      setButtonPressed(false);
    })
  }

  return (
    <div className='reset-password'>
      <form onSubmit={handleSubmit}>

        <label htmlFor='password'>password</label>
        <InputField id="password" name="password" type='text' onChange={handleChange} value={text.password} autoFocus={true}  valid={text.password ? textError.password : null}/>

        <label htmlFor='confirm'>confirm password</label>
        <InputField id="confirm" name="confirm" type='text' onChange={handleChange} value={text.confirm} valid={text.confirm ? textError.confirm : null}/>

        {errorMessage !== "" ? <label className='auth-error-message'>{errorMessage}</label> : null}
        {successMessage ? <label className='auth-success-message'>Password is reset!</label> : <input className="button" type="submit" value="request" disabled={buttonPressed} />}
      </form>
    </div>
  )
}

export default ResetPassword