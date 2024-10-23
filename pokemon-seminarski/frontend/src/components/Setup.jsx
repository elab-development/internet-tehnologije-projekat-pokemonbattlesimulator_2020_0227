import React, { useRef } from 'react'
import { Outlet, useAsyncValue } from 'react-router-dom';
import { UserContext } from '../contexts/UserContextProvider';

const Setup = () => {
  const resolvedData = useAsyncValue();
  /**@type {import('react').MutableRefObject<import('../contexts/UserContextProvider').T_UserContext>} */
  const userRef = useRef(resolvedData.data);
  
  console.log({ user: resolvedData.user, error: resolvedData.message });

  return (
    <UserContext.Provider value={userRef}>
      <Outlet />
    </UserContext.Provider>
  )

}

export default Setup