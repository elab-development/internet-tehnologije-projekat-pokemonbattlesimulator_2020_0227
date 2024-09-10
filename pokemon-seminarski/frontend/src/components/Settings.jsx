import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import InputField from './utils/InputField';
import useDebounce from './utils/useDebounce';
import { z } from 'zod'
import API from './utils/API';

const Settings = () => {
    const { info } = useContext(UserContext);
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

        API.patch(`/user/${info.id}`, {
            ...Object.keys(input).reduce((acc, key) => (
                input[key] !== info[key] && input[key] !== "" ? { ...acc, [key]: input[key] } : acc
            ), {})
        }).then((result) => {
            setSucc('Success yipiiee');
        }).catch((err) => {
            console.error(err);
            setErr(err);
        });
    }

    useEffect(() => {
        let zerrors = [];
        let tempUserError = {}

        //check - email
        if (input.email) {
            let parseResult = z.string().email().optional().safeParse(input.email);
            parseResult.error?.issues.forEach(val => zerrors.push("email - " + val.message));
            !parseResult.success && (tempUserError.email = true);
        }

        //check - inputname
        if (input.username) {
            let parseResult = z.string().min(3).max(15)
                .regex(/^(?![_]).*(?<![_])$/, { message: "Can't begin or end with underscore" })
                .regex(/^(?!.*[_]{2}).*$/, { message: "Can't have two underscores in succesion" })
                .regex(/^[a-zA-Z0-9_]+$/, { message: "Only alphanumerical values " })
                .safeParse(input.username)
            parseResult.error?.issues.forEach(val => zerrors.push("username - " + val.message))
            !parseResult.success && (tempUserError.username = true);
        }

        //check - password
        if (input.password) {
            let parseResult = z.string().min(5)
                .regex(/^(?=.*?[A-Z]).*$/, { message: 'At least one big letter' }) // Barem jedno Jedno veliko slovo
                .regex(/^(?=.*?[a-z]).*$/, { message: 'At least one small letter' }) // Barem jedno malo slovo
                .regex(/^(?=.*?[0-9]).*$/, { message: 'At least one number' }) // Barem jedan broj
                .regex(/^(?=.*?[#?!@$ %^&*-]).*$/, { message: 'At least one special character' }) //Barem jedan znak
                .safeParse(input.password);
            parseResult.error?.issues.forEach(val => zerrors.push("password - " + val.message));
            !parseResult.success && (tempUserError.password = true);

        }

        //check - confirm
        if (input.password && input.confirm && input.password !== input.confirm) {
            zerrors.push("confirm password - not matching");
            tempUserError.confirm = true;
        }

        if (zerrors.length > 0) {
            setErr(zerrors[0] + zerrors.length > 1 && `. (${zerrors.length - 1} more error${zerrors.length - 1 > 1 ? "s" : ""})`);
            setValid(tempUserError);
        }
    }, [inputDebounced]);

    return (
        <div className='settings'>
            <div className='settings-center-block'>
                <form onSubmit={handleSubmit}>
                    <div className='settings-username sf1'> {/**sf1 -> setting fields = 1 (in 1 row)*/}
                        <InputField name="username" value={input.username} onChange={handleInput} placeHolder='username' valid={input.username !== "" ? input.username === info.username || valid.username : null} />
                    </div>
                    <div className='settings-email sf1'> {/** OVO TREBA POGELDATI DODATNO JER EMAIL SE NE ŠALJE //TODO */}
                        <InputField type='email' name="email" value={input.email} onChange={handleInput} placeHolder='email' valid={input.email !== "" ? input.email === info.email || valid.email : null} />
                    </div>
                    <div className='settings-password-wrapper sf2'>
                        <div className='settings-password'>
                            <InputField name="password" value={input.password} onChange={handleInput} placeHolder='new password' valid={input.password !== "" ? input.password === input.confirm && valid.password : null} />
                        </div>
                        <div className='settings-confirm'>
                            <InputField name="confirm" value={input.confirm} onChange={handleInput} placeHolder='confirm new password' valid={input.confirm !== "" ? input.confirm === info.password : null} />
                        </div>
                    </div>
                    <input type='submit' className='settings-submit' value="save" disabled={valid} />
                </form>
                {err !== "" && <label className='settings-label error' >{err}</label>}
                {succ !== "" && <label className='settings-label success' >{succ}</label>}
            </div>
        </div>
    )
}

export default Settings