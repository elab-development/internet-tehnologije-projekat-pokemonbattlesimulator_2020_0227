import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import InputField from './utils/InputField';
import useDebounce from './utils/useDebounce';
import { z } from 'zod'
import API from './utils/api/API';
import './css/Auth/EditProfile.scss'
import { RootContext } from '../contexts/RootContextProvider';
import { Link, useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const { info } = useContext(UserContext);
    const { logout } = useContext(RootContext);
    const navigate = useNavigate();
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: "",
        confirm: ""
    });
    const inputDebounced = useDebounce(input);
    const [valid, setValid] = useState({ email: true, password: true, username: true, confirm: true });
    const [err, setErr] = useState(undefined);
    const [succ, setSucc] = useState(undefined);

    const [isLoadingResponse, setIsLoadingResponse] = useState(false);

    const handleInput = (e) => {
        e.preventDefault();
        const { name, value } = e.target;
        setInput(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!Object.values(valid).every(val => val)) {
            return;
        }

        setIsLoadingResponse(true);
        API.patch(`/users/${info.id}`, {
            ...Object.keys(input).reduce((acc, key) => (
                input[key] !== info[key] && input[key] !== "" ? { ...acc, [key]: input[key] } : acc
            ), {})
        }).then(() => {
            setSucc('Success yipiiee');
        }).catch((err) => {
            console.error(err);
            setErr(err);
        }).finally(() => {
            setIsLoadingResponse(false)
        });
    }

    const handleDeleteAccount = (e) => {
        e.preventDefault();
        const answer = window.confirm("Are you sure you want to delete the Account? Actions cannot be undone");
        if (answer) {
            setIsLoadingResponse(true);
            API.delete(`/users/${info.id}`)
                .then(() => logout())
                .catch((err) => setErr(err))
                .finally(() => setIsLoadingResponse(false));
        }
    }

    useEffect(() => {
        let zerrors = [];
        let tempUserError = {}

        //check - email
        if (inputDebounced.email) {
            let parseResult = z.string().email().optional().safeParse(inputDebounced.email);
            parseResult.error?.issues.forEach(val => zerrors.push("email - " + val.message));
            !parseResult.success && (tempUserError.email = true);
        }

        //check - inputname
        if (inputDebounced.username) {
            let parseResult = z.string().min(3).max(15)
                .regex(/^(?![_]).*(?<![_])$/, { message: "Can't begin or end with underscore" })
                .regex(/^(?!.*[_]{2}).*$/, { message: "Can't have two underscores in succesion" })
                .regex(/^[a-zA-Z0-9_]+$/, { message: "Only alphanumerical values " })
                .safeParse(inputDebounced.username)
            parseResult.error?.issues.forEach(val => zerrors.push("username - " + val.message))
            !parseResult.success && (tempUserError.username = true);
        }

        //check - password
        if (inputDebounced.password) {
            let parseResult = z.string().min(5)
                .regex(/^(?=.*?[A-Z]).*$/, { message: 'At least one big letter' }) // Barem jedno Jedno veliko slovo
                .regex(/^(?=.*?[a-z]).*$/, { message: 'At least one small letter' }) // Barem jedno malo slovo
                .regex(/^(?=.*?[0-9]).*$/, { message: 'At least one number' }) // Barem jedan broj
                .regex(/^(?=.*?[#?!@$ %^&*-]).*$/, { message: 'At least one special character' }) //Barem jedan znak
                .safeParse(inputDebounced.password);
            parseResult.error?.issues.forEach(val => zerrors.push("password - " + val.message));
            !parseResult.success && (tempUserError.password = true);

        }

        //check - confirm
        if (inputDebounced.password && inputDebounced.confirm && inputDebounced.password !== inputDebounced.confirm) {
            zerrors.push("confirm password - not matching");
            tempUserError.confirm = true;
        }

        if (zerrors.length > 0) {
            setErr(zerrors[0] + zerrors.length > 1 && `. (${zerrors.length - 1} more error${zerrors.length - 1 > 1 ? "s" : ""})`);
            setValid(tempUserError);
        }
    }, [inputDebounced]);


    return (
        <div className='edit-profile'>
            <div className='edit-profile-user-data'>
                <button type='button' className='go-back' onClick={() => navigate(`/users/${info.id}`, { replace: true })}><i className="bi bi-arrow-left"></i> To My Career</button>
                <form onSubmit={handleSubmit}>
                    <div className='edit-profile-username'>
                        <InputField name="username" value={input.username} onChange={handleInput} placeHolder={`username: ${info.username}`} valid={input.username !== "" ? input.username === info.username || valid.username : null} />
                    </div>
                    <div className='edit-profile-email'> {/** OVO TREBA POGELDATI DODATNO JER EMAIL SE NE ŠALJE //TODO */}
                        <InputField type='email' name="email" value={input.email} onChange={handleInput} placeHolder={`email: ${info.email}`} valid={input.email !== "" ? input.email === info.email || valid.email : null} />
                    </div>
                    <div className='edit-profile-password-wrapper'>
                        <div className='edit-profile-password'>
                            <InputField name="password" value={input.password} onChange={handleInput} placeHolder='new password' valid={input.password !== "" ? input.password === input.confirm && valid.password : null} />
                        </div>
                        <div className='edit-profile-confirm'>
                            <InputField name="confirm" value={input.confirm} onChange={handleInput} placeHolder='confirm new password' valid={input.confirm !== "" ? input.confirm === info.password : null} />
                        </div>
                    </div>
                    <button type='submit' className='button-full' disabled={valid || isLoadingResponse}>Save Info</button>
                    <button type='button' className='button-full' onClick={handleDeleteAccount} disabled={isLoadingResponse}>Delete Account</button>
                </form>
                {err !== "" && <label className='edit-profile-label error' >{err}</label>}
                {succ !== "" && <label className='edit-profile-label success' >{succ}</label>}
            </div>
        </div>
    )
}

export default EditProfile