import React, { useEffect, useRef, useState } from 'react'

const ERROR_TEXT = "Coudln't copy :(";
const SUCCESS_TEXT = "Copied!";
const LOADING_TEXT = "Copying...";
const BUTTON_TEXT = "Copy URL";

const CopyUrlButton = (props) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isError, setIsError] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => () => {
        timeoutRef.current && clearTimeout(timeoutRef.current);
    }, [])

    const handleClick = async () => {

        setIsLoading(true);
        if (!navigator.clipboard) {
            setIsError(true);
            console.error("Clipboard API is not supported");
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setIsCopied(true);
            } catch (error) {
                setIsError(true);
                console.error("Error occured");
            }
        }
        setIsLoading(false);
        timeoutRef.current = setTimeout(() => {
            setIsError(false);
            setIsCopied(false);
        }, 3000);
    }

    const DISPLAY_TEXT = isCopied ? SUCCESS_TEXT : isError ? ERROR_TEXT : loading ? LOADING_TEXT : BUTTON_TEXT;
    const classes = `button-full${props.className ? ` ${props.className}` : ""}`

    return (
        <button {...props} className={classes} type='button' onClick={handleClick}><i className="bi bi-link-45deg" ></i>{DISPLAY_TEXT}</button>
    )
}

export default CopyUrlButton