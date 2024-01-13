import React, { useEffect, useState } from 'react'
import './css/PokemonDisplay.css'
import { useNavigate, useParams } from 'react-router-dom'
import { height, pokedex, weight } from '../images/components';
import axios from 'axios';
import capitalizeFirstLetter from './util/capitalizeFirstLetter'
import Pokemon from './util/pokemonFunctions'
import ProgressBar from './ProgressBar';
import LeftArrow from './util/LeftArrow';
import RightArrow from './util/RightArrow';
import { AnimatePresence, motion } from "framer-motion"
import Loader from './util/Loader';

const PokemonDisplay = () => {
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(undefined);
  const [state, setState] = useState({
    id: parseInt(useParams().id),
    loading: true,
  });
  const variants = {
    hidden: {
      opacity: 0
    },
    visiblePokemon: {
      opacity: 1,
      transition: { duration: 1 }
    },
    visibleLoading: {
      opacity: 1,
      transition: { duration: 1 }
    },
    exit: {
      opacity: 0,
    }
  }

  const next = () => {
    window.history.pushState({}, null, `/pokemons/${state.id + 1}`);
    setState({
      id: state.id + 1,
      loading: true,
    })
  }

  const prev = () => {
    window.history.pushState({}, null, `/pokemons/${state.id - 1}`);
    setState({
      id: state.id - 1,
      loading: true,
    })
  }

  useEffect(() => {
    if (!state.loading) return;
    const cancelToken = axios.CancelToken.source();
    (() => Pokemon.loadPokemon(state.id, setPokemon, () => navigate('/pokemons'), cancelToken))();
    return () => cancelToken.cancel("Operation canceled by unloading a component");
  }, [state, navigate]);

  useEffect(() => {
    if (pokemon) {
      setState((previous) => {
        return {
          id: previous.id,
          loading: false,
        }
      });
    }
  }, [pokemon]);

  return (
    <div className='poke-display' style={{ backgroundColor: pokemon !== undefined ? `var(--clr-${pokemon?.getMainTypeColor()})` : 'white' }} key="parent">
      {
        <div className='poke-display-inner-wrap'>
          <LeftArrow currentId={pokemon?.id} func={prev} />
          <RightArrow currentId={pokemon?.id} func={next} />


          <div className="image-wrapper">
            <img src={pokedex} alt="pokedex" className='background-detail' />
            <div className="featured-img">
              <AnimatePresence mode='wait'>
                {!state.loading &&
                  <motion.img src={`https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`} alt=""
                    variants={variants} initial="hidden" animate="visiblePokemon" exit="exit" key="pokemon-image"
                  />}
              </AnimatePresence>
            </div>
          </div>

          <div className="detail-card-detail-wrapper">
            <AnimatePresence mode='wait'>
              {state.loading ? <motion.div variants={variants} initial="hidden" animate="visibleLoading" exit="exit" key="pokemon-loader"><Loader /></motion.div> :
                <motion.div className='detail-card-detail-inner-wrapper' variants={variants} initial="hidden" animate="visiblePokemon" exit="exit" key="pokemon-details">
                  <div className="header-details">
                    <div className="name-wrap">
                      <h1 className="name">{capitalizeFirstLetter(pokemon?.name)} #{String(pokemon?.id).padStart(3, "0")}</h1>
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
                      {`${pokemon.description}`}
                    </p>
                    <h3 className="stats-heading">Base stats</h3>
                    <div className="stats-wrapper">
                      <div className="stats-wrap">
                        <p className="stat-name" style={{ borderRight: "1px solid black" }}>HP</p>
                        <p className="stat-value">{String(pokemon.stats[0].base_stat).padStart(3, "0")}</p>
                        <ProgressBar percent={pokemon.stats[0].base_stat} fillColor={`var(--clr-${pokemon?.getMainTypeColor()})`} />
                      </div>
                      <div className="stats-wrap">
                        <p className="stat-name" style={{ borderRight: "1px solid black" }}>ATK</p>
                        <p className="stat-value">{String(pokemon.stats[1].base_stat).padStart(3, "0")}</p>
                        <ProgressBar percent={pokemon.stats[1].base_stat} fillColor={`var(--clr-${pokemon?.getMainTypeColor()})`} />
                      </div>
                      <div className="stats-wrap">
                        <p className="stat-name" style={{ borderRight: "1px solid black" }}>DEF</p>
                        <p className="stat-value">{String(pokemon.stats[2].base_stat).padStart(3, "0")}</p>
                        <ProgressBar percent={pokemon.stats[2].base_stat} fillColor={`var(--clr-${pokemon?.getMainTypeColor()})`} />
                      </div>
                      <div className="stats-wrap">
                        <p className="stat-name" style={{ borderRight: "1px solid black" }}>SATK</p>
                        <p className="stat-value">{String(pokemon.stats[3].base_stat).padStart(3, "0")}</p>
                        <ProgressBar percent={pokemon.stats[3].base_stat} fillColor={`var(--clr-${pokemon?.getMainTypeColor()})`} />
                      </div>
                      <div className="stats-wrap">
                        <p className="stat-name" style={{ borderRight: "1px solid black" }}>SDEF</p>
                        <p className="stat-value">{String(pokemon.stats[4].base_stat).padStart(3, "0")}</p>
                        <ProgressBar percent={pokemon.stats[4].base_stat} fillColor={`var(--clr-${pokemon?.getMainTypeColor()})`} />
                      </div>
                      <div className="stats-wrap">
                        <p className="stat-name" style={{ borderRight: "1px solid black" }}>SPD</p>
                        <p className="stat-value">{String(pokemon.stats[5].base_stat).padStart(3, "0")}</p>
                        <ProgressBar percent={pokemon.stats[5].base_stat} fillColor={`var(--clr-${pokemon?.getMainTypeColor()})`} />
                      </div>
                    </div>
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>
        </div>}
    </div >
  )
}

export default PokemonDisplay