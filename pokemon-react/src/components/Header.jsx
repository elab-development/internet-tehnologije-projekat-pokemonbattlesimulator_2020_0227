import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
    return (
        <header>
            <nav className="navbar">
                <Link to="/" className='nav-logo'>Pokémon domaći.</Link>
                <ul className="nav-meni">
                    <li className="nav-item">
                        <Link to="/" className='nav-link'>Početna</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/pokemons" className='nav-link'>Pokédex</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Header