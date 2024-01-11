import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { cross, pokeball, search, sorting } from '../images/components'
import { BASE_API_URL, MAX_POKEMON } from './util/constants';
import PokemonCard from './PokemonCard';

const Pokedex = () => {

  const [searchInput, setSearchInput] = useState("");
  const [allPokemons, setAllPokemons] = useState([]);


  useEffect(() => {
    (async () => {
      console.log(`${BASE_API_URL}/pokemon?limit=${MAX_POKEMON}`);
      const response = await axios.get(`${BASE_API_URL}/pokemon?limit=${MAX_POKEMON}`)
      console.log(response);
      setAllPokemons(response.data.results);
    })();

    return () => { }
  }, [])

  const handleChange = (e) => {
    e.preventDefault();
  }

  return (
    <>
      <div className='search-wrapper'>
        <img src={pokeball} alt="pokeball" />
        <img src={search} alt="search" />
        <input type="text" name="" id="search-input" className='search-input' />
        <img src={cross} alt="cross" id="search-close-icon" className='search-close-icon' />

        <div className='sort-wrapper'>
          <div className='sort-wrap'>
            <img src={sorting} alt="" id="sort-icon" className='sort-icon' />
          </div>
          <div className='filter-wrapper'>
            <p className='sort-text'>Sortiraj po:</p>
            <div className='filter-wrap'>
              <div>
                <input type="radio" name="filters" id="number" value="number" />
                <label htmlFor="number">Number</label>
              </div>
              <div>
                <input type="radio" name="filters" id="name" value="name" />
                <label htmlFor="name">Name</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pokemon-list">
        <div className="container">
          <div className="list-wrapper">
            {
              allPokemons?.map((value, index) => {
                const splitedUrl = value.url.split('/');
                console.log(splitedUrl, value);
                const pokemon = {
                  id: splitedUrl[splitedUrl.length - 2],
                  name: value.name,
                }
                return <PokemonCard pokemon={pokemon} key={index} />
              })
            }
          </div>
        </div>
        <div id="not-found-nessage">Pokemon Not found</div>
      </div>
    </>
  )
}

export default Pokedex