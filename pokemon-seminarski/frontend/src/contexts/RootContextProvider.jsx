import { createContext } from "react";

/**
 * @typedef {Object} Options
 * @property {boolean} resetConnection - Indicates whether to reset something.
 * @property {string} errorRedirectTo - Who called the notify method
 * @property {string} redirectTo - After successful connection to redirect to
 */

/**
 * @callback Callback
 * @returns {void}
 */

/**
 * @typedef {function({options: Options, cb: Callback}): void} T_RootNotify
 * @typedef {function(): void} T_RootLogout
 * @typedef {{notify: T_RootNotify, logout: T_RootLogout}} T_RootContext
 */


/**@type {React.Context<T_RootContext>} */
export const RootContext = createContext();