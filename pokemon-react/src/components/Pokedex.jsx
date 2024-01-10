import React from 'react'
import { cross, pokeball, search, sorting } from '../images/components'

const Pokedex = () => {
  return (
    <>
      <div className='search-wrapper'>
        <img src={pokeball} alt="pokeball" />
        <img src={search} alt="search" />
        <input type="text" name="" id="search-input" className='search-input' />
        <img src={cross} alt="cross" id="search-close-icon" className='search-close-icon'/>
        <div className='sort-wrapper'>
          <div className='sort-wrap'>
            <img src={sorting} alt="" id="sort-icon" className='sort-icon'/>
          </div>
          <div></div>
        </div>
      </div>
    </>
  )
}

export default Pokedex