import React, { useEffect, useState } from 'react'
import './css/PokemonDisplay.css'
import { useNavigate, useParams } from 'react-router-dom'
import {  height, pokedex, weight } from '../images/components';
import { MAX_POKEMON } from './util/constants';
import axios from 'axios';
import ProgressBar from './ProgressBar';
import LeftArrow from './util/LeftArrow';
import RightArrow from './util/RightArrow';
import capitalizeFirstLetter from './util/capitalizeFirstLetter';

const PokemonDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(undefined);
  const [pokemonSpecies, setPokemonSpecies] = useState(undefined);
  
  const getEnglishText = () => {
    for (const entry of pokemonSpecies.flavor_text_entries) {
      if (entry.language.name === "en") {
        const flavor = entry.flavor_text.replace(/\f/g, " ");
        return flavor;
      }
    }
    return "";
  }

  const getMainTypeColor = () => {
    return pokemon.types[0].type.name;
  }

  useEffect(() => {
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

    if (id < 1 || id > MAX_POKEMON) {
      navigate('/pokemons');
    }
    loadPokemon();
  }, [id, navigate]);


  return (
    <div className='poke-display' style={{ backgroundColor: pokemon !== undefined ? `var(--clr-${getMainTypeColor()})` : 'white' }}>
      {pokemon === undefined && pokemonSpecies === undefined ? <div className='loading-text'>Loading...</div> :
        <>
          <LeftArrow currentId={pokemon.id} />
          <RightArrow currentId={pokemon.id} />

          <div className="image-wrapper">
            <img src={pokedex} alt="pokedex" className='background-detail' />
            <div className="featured-img">
              <img src={`https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`} alt="" />
            </div>
          </div>

          <div className="wrap-wrap">
            <div className="detail-card-detail-wrapper">
              <div className="header-details">
                <div className="name-wrap">
                  <h1 className="name">{capitalizeFirstLetter(pokemon.name)} #{String(pokemon.id).padStart(3, "0")}</h1>
                </div>
              </div>
              <div className="pokemon-detail-wrapper">
                <div className="pokemon-detail-wrap">

                  <div className="pokemon-detail" style={{ borderRight: "1px solid black" }}>
                    <div className="pokemon-detail-group">
                      <img src={weight} alt="" />
                      <p>{pokemon.weight}kg</p>
                    </div>
                    <p>Weight</p>
                  </div>

                  <div className="pokemon-detail">
                    <div className="pokemon-detail-group">
                      {
                        pokemon.types.map((value, index) => {
                          return <p className="detail-type" key={index} style={{ backgroundColor: `var(--clr-${value.type.name})` }}>
                            {value.type.name.toUpperCase()}
                          </p>
                        })
                      }
                    </div>
                    <p>Type</p>
                  </div>

                  <div className="pokemon-detail" style={{ borderLeft: "1px solid black" }}>
                    <div className="pokemon-detail-group">
                      <img src={height} alt="" />
                      <p>{pokemon.height}m</p>
                    </div>
                    <p>Height</p>
                  </div>


                </div>
                <p className="pokemon-description">
                  {`${getEnglishText()}`}
                </p>
                <h3 className="stats-heading">Base stats</h3>
                <div className="stats-wrapper">
                  <div className="stats-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>HP</p>
                    <p className="stat-value">{String(pokemon.stats[0].base_stat).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.stats[0].base_stat} fillColor={`var(--clr-${getMainTypeColor()})`} />
                  </div>
                  <div className="stats-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>ATK</p>
                    <p className="stat-value">{String(pokemon.stats[1].base_stat).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.stats[1].base_stat} fillColor={`var(--clr-${getMainTypeColor()})`} />
                  </div>
                  <div className="stats-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>DEF</p>
                    <p className="stat-value">{String(pokemon.stats[2].base_stat).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.stats[2].base_stat} fillColor={`var(--clr-${getMainTypeColor()})`} />
                  </div>
                  <div className="stats-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>SATK</p>
                    <p className="stat-value">{String(pokemon.stats[3].base_stat).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.stats[3].base_stat} fillColor={`var(--clr-${getMainTypeColor()})`} />
                  </div>
                  <div className="stats-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>SDEF</p>
                    <p className="stat-value">{String(pokemon.stats[4].base_stat).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.stats[4].base_stat} fillColor={`var(--clr-${getMainTypeColor()})`} />
                  </div>
                  <div className="stats-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>SPD</p>
                    <p className="stat-value">{String(pokemon.stats[5].base_stat).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.stats[5].base_stat} fillColor={`var(--clr-${getMainTypeColor()})`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>}
    </div>
  )
}

export default PokemonDisplay