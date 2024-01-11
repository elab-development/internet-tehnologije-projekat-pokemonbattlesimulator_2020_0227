import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { backToHome, chevronLeft, chevronRight, height, pokedex, weight } from '../images/components';
import { MAX_POKEMON } from './util/constants';
import axios from 'axios';
import ProgressBar from './ProgressBar';

const PokemonDisplay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(undefined);


  const loadPokemon = async () => {
    const baseInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const speciesInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`);



  }

  useEffect(() => {
    if (id < 1 || id > MAX_POKEMON) {
      navigate('/pokemons');
    }
    loadPokemon();
  }, []);
  return (
    <div className='poke-display'>
      <img src={chevronLeft} alt="left-arrow" className='left-arrow' />
      <img src={chevronRight} alt="right-arrow" className='right-arrow' />

      <div className="header-phone">
        <img src={backToHome} alt="back-to-pokedex" />
        <div className="name-wrap">
          <h1 className="name"> </h1>
        </div>
      </div>
      <div className="pokemon-id-wrap">
        <p></p>
      </div>

      <div className="featured-img">
        <img src="" alt="" />
      </div>
      <div className="detail-card-detail-wrapper">
        <p className="about-pokemon">About</p>
        <div className="pokemon-detail-wrapper">
          <div className="pokemon-detail-wrap">
            <div className="pokemon-detail">
              <img src={weight} alt="" />
              <p>{/*weight */}</p>
            </div>
            <p>Weight</p>
            <div className="pokemon-detail">
              {/*type of pokemon grass water */}
            </div>
            <p>Weight</p>
            <div className="pokemon-detail">
              <img src={height} alt="" />
              <p>{/*height */}</p>
            </div>
            <p>Weight</p>
          </div>
          <p className="pokemon-description">{/**description */}</p>
          <p className="pokemon-stats"></p>
          <div className="stats-wrapper">
            <div className="stats-wrap">
              <p className="stat-name">HP</p>
              <p className="stat-value"></p>
              <ProgressBar percent={30} backgroundColor={"ligthgray"} fillColor={"green"}/>
            </div>
            <div className="stats-wrap">
              <p className="stat-name">ATK</p>
              <p className="stat-value"></p>
              <ProgressBar percent={30} backgroundColor={"ligthgray"} fillColor={"green"}/>
            </div>
            <div className="stats-wrap">
              <p className="stat-name">DEF</p>
              <p className="stat-value"></p>
              <ProgressBar percent={30} backgroundColor={"ligthgray"} fillColor={"green"}/>
            </div>
            <div className="stats-wrap">
              <p className="stat-name">SATK</p>
              <p className="stat-value"></p>
              <ProgressBar percent={30} backgroundColor={"ligthgray"} fillColor={"green"}/>
            </div>
          </div>
        </div>
      </div>
      <img src={pokedex} alt="pokedex" className='background-detail' />
    </div>
  )
}

export default PokemonDisplay