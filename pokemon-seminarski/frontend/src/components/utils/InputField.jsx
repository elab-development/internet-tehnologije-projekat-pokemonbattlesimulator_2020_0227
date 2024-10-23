import React from 'react'
import '../css/Util/InputField.scss'

const InputField = ({ value, required = false, onChange, placeHolder = "", name, valid = undefined, type = 'text', passRef,...props }) => {
    return (
        <input className={`input-text${valid != null ? (valid ? " input-text-valid" : " input-text-invalid") : ""}`}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeHolder}
            ref={passRef}
            {...props}
        />
    )
}

export default InputField