import React, { createContext, useEffect, useRef, useState } from 'react'

/**
 * @typedef {{currentGame: number | null}} SocketInformation
 */
/**
 * @template T
 * @typedef {[T, import("react").Dispatch<import('react').SetStateAction<T>>]} useState 
 */
/**
 * @typedef {import('../../../backend/utils/typedefs').UserSelect} UserBase
 */
/**
 * @typedef {Object} UserExtend
 * @property {SocketInformation} socketInformation
 * 
 * @typedef {UserBase & UserExtend} User
 */
/**
 * @typedef T_UserContext
 * @property {User} info
 * @property {string} token
 */
/**
 * @typedef T_UserContextState
 * @property {User} info
 * @property {import("react").Dispatch<import('react').SetStateAction<User>>} setInfo
 * @property {import("react").MutableRefObject<string>} disconnectReason
 */

/*@type {React.Context<import('react').MutableRefObject<T_UserContext>>} */

/**@type {React.Context<T_UserContextState>} */
export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    /**@type {[user: User, setInfo: import("react").Dispatch<import('react').SetStateAction<User>>]} */
    const [info, setInfo] = useState(null);
    const disconnectReason = useRef("");

    useEffect(() => {
        console.log(info);
    }, [info])

    return (
        <UserContext.Provider value={{ info, setInfo, disconnectReason }}>
            {children}
        </UserContext.Provider>
    )
}
export default UserContextProvider;

