import React, { useEffect, useState } from 'react'
import './css/Pokedex.css'
import axios from 'axios';
import { cross, pokeball } from '../images/components'
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

  console.log(pageNumber === Math.ceil(displayedPokemons.length / PER_PAGE));
  console.log(pageNumber);
  console.log(Math.ceil(displayedPokemons.length / PER_PAGE));
  console.log(Math.ceil(displayedPokemons.length / PER_PAGE));

  return (
    <>
      <div className="pokedex">

        <div className='first-two-wrap'>
          <div className='search-wrapper'>
            <div className="pokeball-icon-wrapper">
              <img src={pokeball} alt="pokeball" className='pokeball-icon' />
            </div>
            <input type="text" onChange={handleChange} value={searchInput} name="" className='search-input' placeholder='Pretraži' />
            {searchInput === "" ? undefined :
              <div className='search-close-icon-wrapper'>
                <img src={cross} onClick={() => setSearchInput("")} alt="cross" id="search-close-icon" className='search-close-icon' />
              </div>
            }
          </div>
          <div className="pokemon-list" style={{margin: filteredPokemons.length !== 0 ? "" : 0}}>
            {
              filteredPokemons.length === 0 ?
                undefined :
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
            }
          </div>
        </div>

        {
          filteredPokemons.length === 0 ? <div class="not-found-message">Pokemon Not found</div> :
            <div className="pages">
              <span className="prev-page">
                <button
                  onClick={() => handlePageChange(pageNumber - 1)} disabled={pageNumber === 1}
                  className={`page-number`}
                >&#60;</button>
              </span>
              <div className="page-numbers-wrap">
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
              <span className='next-page'>
                <button
                  onClick={() => handlePageChange(pageNumber + 1)} disabled={pageNumber === Math.ceil(filteredPokemons.length / PER_PAGE)}
                  className={`page-number`} value={">"}
                >&#62;</button>
              </span>
            </div>
        }
      </div>
    </>
  )
}

export default Pokedex