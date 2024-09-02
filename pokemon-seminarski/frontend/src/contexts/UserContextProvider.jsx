import React, { createContext, useRef, useState } from 'react'

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
 * @property {import("react").Dispatch<import('react').SetStateAction<T_UserContext>>} setUser
 * @property {string} token
 */

/*@type {React.Context<import('react').MutableRefObject<T_UserContext>>} */

/**@type {React.Context<T_UserContextState>} */
export const UserContext = createContext();

export default UserContextProvider = ({ children }) => {
    /**@type {[user: T_UserContext, setUser: import("react").Dispatch<import('react').SetStateAction<T_UserContext>>]} */
    const  [user, setUser] = useState({info: null, token: ""});
    
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}

