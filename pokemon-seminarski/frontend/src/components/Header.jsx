import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../contexts/UserContextProvider'

const Header = () => {
  const userRef = useContext(UserContext);
  return (
    <header>
      <div className='nav-item-wrapper'><span className="nav-item"><Link to='/home'>home</Link></span></div>
      <div className='nav-item-wrapper'><span className="nav-item"><Link to='/pokedex'>pokédex</Link></span></div>
      <div className='nav-item-wrapper'><span className="nav-item"><Link to={`/users/${userRef.current.user.id}`}>carrer</Link></span></div>
      <div className='nav-item-wrapper'><span className="nav-item"><Link to={`/users/${userRef.current.user.id}/collection`}>collection</Link></span></div>
      <div className='nav-item-wrapper-central'><div><span className="nav-item nav-item-center">play</span></div></div>
    </header >
  )
}

export default Header