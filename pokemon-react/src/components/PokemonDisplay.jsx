import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { backToHome, chevronLeft, chevronRight, height, pokedex, weight } from '../images/components';
import { MAX_POKEMON } from './util/constants';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import LeftArrow from './util/LeftArrow';
import RightArrow from './util/RightArrow';

const PokemonDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(undefined);
  const [pokemonSpecies, setPokemonSpecies] = useState(undefined);



  const loadPokemon = async () => {
    const baseInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const speciesInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    setPokemon({
      id: baseInfo.data.id,
      name: baseInfo.data.name,
      types: baseInfo.data.types,
      weight: baseInfo.data.weight,
      height: baseInfo.data.height,
      abilities: baseInfo.data.abilities,
      stats: baseInfo.data.stats
    });
    setPokemonSpecies(speciesInfo.data);
  }

  const getEnglishText = () => {
    for (const entry of pokemonSpecies.flavor_text_entries) {
      if (entry.language.name = "en") {
        const flavor = entry.flavor_text.replace(/\f/g, " ");
        return flavor;
      }
    }
    return "";
  }

  const getMainTypeColor = () => {
    return pokemon.types[0].type.name;
  }

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

  useEffect(() => {
    if (id < 1 || id > MAX_POKEMON) {
      navigate('/pokemons');
    }
    loadPokemon();
  }, []);


  return (
    <div className='poke-display' style={{backgroundColor: pokemon !== undefined ? `var(--clr-${getMainTypeColor()})` : 'white'}}>
      {pokemon === undefined && pokemonSpecies === undefined ? <div className='loading-text'>Loading...</div> :
        <>
          <LeftArrow currentId={id} />
          <RightArrow currentId={id} />

          <div className="header-phone">
            <img src={backToHome} alt="back-to-pokedex" />
            <div className="name-wrap">
              <h1 className="name">{capitalizeFirstLetter(pokemon.name)}</h1>
            </div>
          </div>
          <div className="pokemon-id-wrap">
            <p>{pokemon.id}</p>
          </div>

          <div className="featured-img">
            <img src="" alt="" />
          </div>
          <div className="detail-card-detail-wrapper" style={{backgroundColor: "white"}}>
            <p className="about-pokemon">About</p>
            <div className="pokemon-detail-wrapper">
              <div className="pokemon-detail-wrap">
                <div className="pokemon-detail">
                  <img src={weight} alt="" />
                  <p>{/*weight */}</p>
                </div>
                <p>Weight</p>
                <div className="pokemon-detail">
                  {
                    pokemon.types.map((value, index) => {
                      return <p className="detail-type" key={index} style={{backgroundColor: `var(--clr-${value.type.name})`}}>
                        {value.type.name}
                      </p>
                    })
                  }
                </div>
                <p>Type</p>
                <div className="pokemon-detail">
                  <img src={height} alt="" />
                  <p>{/*height */}</p>
                </div>
                <p>Height</p>
              </div>
              <p className="pokemon-description">
                {`${getEnglishText()}`}
              </p>
              <p className="pokemon-stats"></p>
              <div className="stats-wrapper">
                <div className="stats-wrap">
                  <p className="stat-name">HP</p>
                  <p className="stat-value"></p>
                  <ProgressBar percent={30} fillColor={`var(--clr-${getMainTypeColor()})`} />
                </div>
                <div className="stats-wrap">
                  <p className="stat-name">ATK</p>
                  <p className="stat-value"></p>
                  <ProgressBar percent={30} fillColor={`var(--clr-${getMainTypeColor()})`} />
                </div>
                <div className="stats-wrap">
                  <p className="stat-name">DEF</p>
                  <p className="stat-value"></p>
                  <ProgressBar percent={30} fillColor={`var(--clr-${getMainTypeColor()})`} />
                </div>
                <div className="stats-wrap">
                  <p className="stat-name">SATK</p>
                  <p className="stat-value"></p>
                  <ProgressBar percent={30} fillColor={`var(--clr-${getMainTypeColor()})`} />
                </div>
                <div className="stats-wrap">
                  <p className="stat-name">SDEF</p>
                  <p className="stat-value"></p>
                  <ProgressBar percent={30} fillColor={`var(--clr-${getMainTypeColor()})`} />
                </div>
                <div className="stats-wrap">
                  <p className="stat-name">SPD</p>
                  <p className="stat-value"></p>
                  <ProgressBar percent={30} fillColor={`var(--clr-${getMainTypeColor()})`} />
                </div>
              </div>
            </div>
          </div>
          <img src={pokedex} alt="pokedex" className='background-detail' />
        </>}
    </div>
  )
}

export default PokemonDisplay