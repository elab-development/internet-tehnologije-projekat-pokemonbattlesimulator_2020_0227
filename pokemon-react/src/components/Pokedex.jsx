import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { cross, pokeball, search, sorting } from '../images/components'
import { BASE_API_URL, MAX_POKEMON, PER_PAGE } from './util/constants';
import PokemonCard from './PokemonCard';

const Pokedex = () => {

  const [searchInput, setSearchInput] = useState("");
  const [allPokemons, setAllPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [displayedPokemons, setDisplayedPokemons] = useState([]);

  const [pageNumber, setPageNumber] = useState(1);

  const fetchData = async () => {
    const response = await axios.get(`${BASE_API_URL}/pokemon?limit=${MAX_POKEMON}`)
    setAllPokemons(response.data.results);
    setFilteredPokemons(response.data.results);
  };

  useEffect(() => {
    fetchData();
    return () => { }
  }, [])

  /* Filtrira pokemone */
  useEffect(() => {
    if (/^\d+$/.test(searchInput)) {
      setFilteredPokemons(allPokemons.filter((pokemon) => {
        return pokemon.url.split('/')[6] === searchInput.trim();
      }));
    } else {
      setFilteredPokemons(allPokemons.filter((pokemon) => {
        return pokemon.name.toLowerCase().startsWith(searchInput);
      }));
    }
    setPageNumber(1);
  }, [searchInput]);

  useEffect(() => {
    updateDisplayedPokemons();
  }, [filteredPokemons, pageNumber]);

  const updateDisplayedPokemons = () => {
    const startIndex = (pageNumber - 1) * PER_PAGE;
    const endIndex = startIndex + PER_PAGE;
    const pagePokemons = filteredPokemons.slice(startIndex, endIndex);
    setDisplayedPokemons(pagePokemons);
  };

  const handleChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value.toLowerCase());
  }

  const handlePageChange = newPageNumber => {
    setPageNumber(newPageNumber);
  };

  const generatePageNumbers = (currentPage, totalPageCount) => {
    const visiblePageCount = 5;
    const pageNumbers = [];

    for (let i = 1; i <= totalPageCount; i++) {
      if (i === 1 || i === totalPageCount || Math.abs(currentPage - i) <= Math.floor(visiblePageCount / 2)) {
        pageNumbers.push(i);
      } else if (pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1] !== '...') {
        pageNumbers.push('...');
      }
    }

    return pageNumbers;
  };
  
  return (
    <>
      <div className='search-wrapper'>
        <img src={pokeball} alt="pokeball" />
        <img src={search} alt="search" />
        <input type="text" onChange={handleChange} value={searchInput} name="" id="search-input" className='search-input' />
        <img src={cross} onClick={() => setSearchInput("")} alt="cross" id="search-close-icon" className='search-close-icon' />

        <div className='sort-wrapper'>
          <div className='sort-wrap'>
            <img src={sorting} alt="" id="sort-icon" className='sort-icon' />
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
                  displayedPokemons?.map((value, index) => {
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

      <div className="previous"></div>
      <div className="pages">
        {generatePageNumbers(pageNumber, Math.ceil(filteredPokemons.length / PER_PAGE)).map((page, index) => (
          <span key={index}>
            {page === '...' ? (
              '...'
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={`page-number ${page === pageNumber ? 'active' : ''}`}
              >
                {page}
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="next"></div>
    </>
  )
}

export default Pokedex