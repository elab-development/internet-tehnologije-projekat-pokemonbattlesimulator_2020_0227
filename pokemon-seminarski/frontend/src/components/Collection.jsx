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
      pokemon.canEvolve = pokemon.evolvesToPokemonId != null && pokemon.xp >= 100 && !pokemons.some(p => p.id === pokemon.evolvesToPokemonId);
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

/**
 * @returns {UsersPokemonExpanded[]}
 */
const loadUserPokemons = async (userId) => {
   try {
      /**@type {UsersPokemonBackend[]} */
      const pokemonsDB = (await API.get(`/users/${userId}/pokemons`)).data; // MY API

      if (pokemonsDB.length === 0) {
         return [];
      }

      const fetchPromises = pokemonsDB.map(async (element) => {
         const pokemon = (await loadApiData(element.id));
         return {
            ...element,
            ...pokemon,
         };
      });

      const result = await Promise.all(fetchPromises);
      evolutionToBoolean(result);

      console.log('All pokemons have been loaded and updated:', result);
      return result;
   } catch (error) {
      console.error(error.toJSON?.() || error.message);
      return null;
   }
}

/** 
 * Collection of users pokemon
 * @param {{
 *    cardClickEvent: (clickedpokemon: UsersPokemonExpanded) => Promise, 
 *    id?: number | undefined, 
 *    cardOptions: {evolvable?: boolean, selectable?: boolean},
 *    selectedArray: Array<UsersPokemon | null>
 * }} 
 */
const Collection = ({ cardClickEvent = undefined, id = undefined, cardOptions, selectedArray }) => {
   const { info } = useContext(UserContext);
   const [loaded, setLoaded] = useState(false);
   /**@type {[UsersPokemonExpanded[], React.Dispatch<React.SetStateAction<UsersPokemonExpanded[]>>]} */
   const [pokemons, setPokemons] = useState([]);
   const [resetQuery, setResetQuery] = useState({});

   /**@param {UsersPokemonExpanded} pokemon*/
   const handleClick = async (pokemon) => {
      await cardClickEvent?.(pokemon);
      if (cardOptions && cardOptions.evolvable) setResetQuery({});
   }

   const isSelected = (pokemon) => selectedArray?.some(p => p?.id === pokemon.id);

   useEffect(() => {
      (async () => {
         const loaded = (await loadUserPokemons(id ?? info.id)) ?? [];
         setPokemons(loaded);
         setLoaded(true);
      })();
   }, [info, id, resetQuery])

   return (
      <div className="collection">
         {!loaded ? (
            <div className='collection-loading'>
               loading...
            </div>
         ) : (
            pokemons.map((pokemon) =>
               <PokemonCard
                  key={pokemon.id}
                  pokemon={pokemon}
                  onClick={handleClick}
                  options={cardOptions}
                  isSelected={isSelected(pokemon)}
               />
            )
         )}
      </div>
   )
}

export default Collection