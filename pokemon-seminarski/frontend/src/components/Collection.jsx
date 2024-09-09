import React, { useContext, useEffect, useState } from 'react'
import API from './utils/API';
import { UserContext } from '../contexts/UserContextProvider';
import axios from 'axios';
import PokemonCard from './utils/PokemonCard';


/**
 * @typedef {{id: number, name: string, attackBase: number}} PokemonMove_SV Short version of pokemon move
 * @typedef {{id: number, name: string}} Type_SV Short version
 * @typedef {{id: number, xp: number, baseStats: [def: number, hp: number], type: Type_SV[], moves: PokemonMove_SV[], createdAt: Date}} UsersPokemon
 */

const pokeAPI = "https://pokeapi.co/api/v2";
const pokeGITAPI = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;

const loadUserPokemons = async (userId) => {
   try {
      /**@type {UsersPokemon[]} */
      const pokemonsDB = (await API.get(`/users/${userId}/pokemons`)).data; // MY API

      if (pokemonsDB.length === 0) {
         return;
      }

      const fetchPromises = pokemonsDB.map(async (element) => {
         const { id } = element;
         const newData = {};

         const pPokemonResponse = await axios.get(`${pokeAPI}/pokemon/${id}`);
         const pPokemon = pPokemonResponse.data;
         newData.name = pPokemon.name;
         newData.picture = pPokemon.sprites.other.dream_world.front_default;

         const pPokemonSpeciesResponse = await axios.get(`${pPokemon.species.url}`);
         const pPokemonSpecies = pPokemonSpeciesResponse.data;

         newData.flavorText = pPokemonSpecies.flavor_text_entries?.[0]?.flavor_text || 'No description available';

         return {
            ...element,
            ...newData,
         };
      });

      const updatedPokemons = await Promise.all(fetchPromises);

      //setPokemons(updatedPokemons);
      //setLoaded(true);
      console.log('All pokemons have been loaded and updated:', updatedPokemons);

      return updatedPokemons;
   } catch (error) {
      console.error(error.toJSON?.() || error.message);
   }
}

/** Collection of users pokemon*/
const Collection = ({ horizontal = false, cardClickEvent = undefined, id = undefined, additionalClassesToCards = [] }) => {
   const { info } = useContext(UserContext);
   const [loaded, setLoaded] = useState(false);
   const [pokemons, setPokemons] = useState([]);

   const handleClick = async (pokemon) => {
      pokemon = await cardClickEvent?.(pokemon);
      setPokemons(prev => prev.map(p => p.id ? { ...pokemon } : { ...p }));
   }

   useEffect(() => {
      (async () => {
         setPokemons(loadUserPokemons(id ?? info.id));
         setLoaded(true);
      })();
   }, [info, id])

   return (
      <div className={`collection${horizontal ? " collection-horizontal" : ""}`}>
         {!loaded ? null :
            pokemons.map((pokemon) => {
               return (
                  <PokemonCard pokemon={pokemon} onClick={handleClick} classNames={additionalClassesToCards}/>
               );
            })
         }
      </div>
   )
}

export default Collection