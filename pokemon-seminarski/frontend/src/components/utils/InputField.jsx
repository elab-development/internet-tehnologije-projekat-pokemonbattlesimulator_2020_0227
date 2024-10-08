import React from 'react'

const InputField = ({ value, required = false, onChange, placeHolder = "", name, valid = undefined, type = 'text',...props }) => {
    return (
        <input className={`input-text${valid != null ? (valid ? " input-text-valid" : " input-text-invalid") : ""}`}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeHolder}
            {...props}
        />
    )
}

export default InputField