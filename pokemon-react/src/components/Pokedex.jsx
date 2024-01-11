import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { cross, pokeball, search, sorting } from '../images/components'
import { BASE_API_URL, MAX_POKEMON } from './util/constants';
import PokemonCard from './PokemonCard';

const Pokedex = () => {

  const [searchInput, setSearchInput] = useState("");
  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchParams, setSearchParams] = useState("number");
  const fetchData = async () => {
    const response = await axios.get(`${BASE_API_URL}/pokemon?limit=${MAX_POKEMON}`)
    setAllPokemons(response.data.results);
    setFilteredPokemons(response.data.results);
  };

  useEffect(() => {
    fetchData();
    return () => { }
  }, [])

  useEffect(() => {
    switch (searchParams) {
      case "name":
        setFilteredPokemons(allPokemons.filter((pokemon) => {
          return pokemon.name.toLowerCase().startsWith(searchInput);
        }));
        break;
      case "number":
        setFilteredPokemons(allPokemons.filter((pokemon) => {
          return pokemon.url.split('/')[6] === searchInput.trim();
        }));
        break;
    }
  }, [searchInput]);

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value.toLowerCase());
  }
  

  return (
    <>
      <div className='search-wrapper'>
        <img src={pokeball} alt="pokeball" />
        <img src={search} alt="search" />
        <input type="text" onChange={handleChange} value={searchInput} name="" id="search-input" className='search-input' />
        <img src={cross} onClick={() => setSearchInput("")}alt="cross" id="search-close-icon" className='search-close-icon' />

        <div className='sort-wrapper'>
          <div className='sort-wrap'>
            <img src={sorting} alt="" id="sort-icon" className='sort-icon' />
          </div>
          <div className='filter-wrapper'>
            <p className='sort-text'>Sortiraj po:</p>
            <div className='filter-wrap'>
              <div>
                <input type="radio" name="filters" id="number" value="number" checked={true} onChange={(e) => setSearchParams(e.target.value)} />
                <label htmlFor="number">Number</label>
              </div>
              <div>
                <input type="radio" name="filters" id="name" value="name" onChange={(e) => setSearchParams(e.target.value)} />
                <label htmlFor="name">Name</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="pokemon-list">
        {
          filteredPokemons.length === 0 ?
            <div id="not-found-nessage">Pokemon Not found</div> :
            <div className="container">
              <div className="list-wrapper">
                {
                  filteredPokemons?.map((value, index) => {
                    const pokemon = {
                      id: value.url.split('/')[6],
                      name: value.name,
                    }
                    return <PokemonCard pokemon={pokemon} key={index} />
                  })
                }
              </div>
            </div>
        }
      </div>
    </>
  )
}

export default Pokedex