import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/UserContextProvider'
import './css/Auth/Header.scss'

const Header = () => {
  const { info } = useContext(UserContext);
  return (
    <header>
      <div className='nav-item-wrapper'><span className="nav-item"><Link to='/home'>home</Link></span></div>
      <div className='nav-item-wrapper-central'>
        <span className="nav-item">play</span>
      </div>
      <div className='nav-item-wrapper nav-third'><span className="nav-item"><Link to={`/users/${info.id}`}>carrer</Link></span></div>
    </header >
  )
}

export default Header