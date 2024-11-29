import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import './css/NoAuth/Welcome.scss'

const Welcome = () => {
  const location = useLocation();
  const [error, setError] = useState(location.state?.error);

  useEffect(() => {
    window.history.replaceState({}, ''); // Clear state if any
  }, []);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className='welcome-page'>
      <h1>{error || "Welcome to the fake pokemon game!!"}</h1>
      <div className='welcome-page-description'>
        <p>already have an account?</p>
        <div >
          <Link to={'/login'}>log in!</Link>
        </div>
        <p>don't have an account?</p>
        <div>
          <Link to={'/register'}>register now!</Link>
        </div>
      </div>
    </div >
  )
}

export default Welcome