import React, { useContext, useEffect, useState } from 'react'
import API from './utils/api/API';
import { UserContext } from '../contexts/UserContextProvider';
import axios from 'axios';
import PokemonCard from './utils/PokemonCard';


/**
 * @typedef {{name: string, picture: string, flavorText: string}} UsersPokemonExpansion
 * @typedef {import('../../../backend/db/services/userServices').UsersPokemon} UsersPokemonBackend
 * @typedef {{
 *      id: number, 
 *      xp: number, 
 *      createdAt: Date,
 *      canEvolve: boolean 
 *      baseStats: {
 *          defenseBase: number, 
 *          healthPointsBase: number
 *      }, 
 *      type: {
 *          id: number, 
 *          name: string
 *      }[], 
 *      moves: {
 *          id: number, 
 *          name: string, 
 *          attackBase: number, 
 *          mana: number, 
 *          type: {
 *              id: number,
 *              name: string
 *          }
 *       }[]
 *  }} UsersPokemon Frontend implementation where pokemon that evolves to is stripped and replaced with boolean value is stripped and c
 * @typedef {UsersPokemon & UsersPokemonExpansion} UsersPokemonExpanded
 */

const pokeAPI = "https://pokeapi.co/api/v2";
export const pokeGITAPI = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;


/**@param {(UsersPokemonBackend & UsersPokemonExpansion)[]} pokemons*/
const evolutionToBoolean = (pokemons) => {
   for (const pokemon of pokemons) { // Removes evolves to id and adds a canEvolve property
      pokemon.canEvolve = pokemon.evolvesToPokemonId != null && pokemons.some(val => val.id === pokemon.evolvesToPokemonId) && pokemon.xp >= 100;
      delete pokemon.evolvesToPokemonId;
   }
}

export const loadApiData = async (id) => {
   const pPokemonResponse = await axios.get(`${pokeAPI}/pokemon/${id}`);
   const pPokemon = pPokemonResponse.data;
   const pPokemonSpeciesResponse = await axios.get(`${pPokemon.species.url}`);
   const pPokemonSpecies = pPokemonSpeciesResponse.data;
   return {
      name: pPokemon.name,
      picture: pPokemon.sprites.other.dream_world.front_default,
      flavorText: pPokemonSpecies.flavor_text_entries?.[0]?.flavor_text || 'No description available'
   }
}

const loadUserPokemons = async (userId) => {
   try {
      /**@type {UsersPokemonBackend[]} */
      const pokemonsDB = (await API.get(`/users/${userId}/pokemons`)).data; // MY API

      if (pokemonsDB.length === 0) {
         return [];
      }

      const fetchPromises = pokemonsDB.map(async (element) => {
         const { id } = element;
         return {
            ...element,
            ...loadApiData(id),
         };
      });

      /**@type {UsersPokemonExpanded[]} */
      const updatedPokemons = evolutionToBoolean(await Promise.all(fetchPromises));


      console.log('All pokemons have been loaded and updated:', updatedPokemons);

      return updatedPokemons;
   } catch (error) {
      console.error(error.toJSON?.() || error.message);
      return null;
   }
}

/** 
 * Collection of users pokemon
 * @param {{horizontal?: boolean, cardClickEvent: (clickedpokemon: UsersPokemonExpanded, setPokemons: React.Dispatch<React.SetStateAction<UsersPokemonExpanded>>) => Promise, id?: number | undefined, cardOptions: {}}}
 */
const Collection = ({ horizontal = false, cardClickEvent = undefined, id = undefined, cardOptions }) => {
   const { info } = useContext(UserContext);
   const [loaded, setLoaded] = useState(false);
   /**@type {[UsersPokemonExpanded[], React.Dispatch<React.SetStateAction<UsersPokemonExpanded[]>>]} */
   const [pokemons, setPokemons] = useState([]);

   /**@param {UsersPokemonExpanded} pokemon*/
   const handleClick = async (pokemon) => {
      await cardClickEvent?.(pokemon, setPokemons);
   }

   useEffect(() => {
      (async () => {
         setPokemons(await loadUserPokemons(id ?? info.id) ?? []);
         setLoaded(true);
      })();
   }, [info, id])

   return (
      <div className={`collection${horizontal ? " collection-horizontal" : ""}`}>
         {!loaded ? null :
            pokemons.map((pokemon) => {
               return (
                  <PokemonCard pokemon={pokemon} onClick={handleClick} options={cardOptions} />
               );
            })
         }
      </div>
   )
}

export default Collection