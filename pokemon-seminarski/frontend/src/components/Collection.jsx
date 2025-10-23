import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider';
import PokemonCard from './utils/PokemonCard';
import { getAllPokemons, loadUserPokemons } from './utils/api/services/pokemonService';

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

export const pokeGITAPI = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;


/** 
 * Collection of users pokemon
 * @param {{
 *    cardClickEvent: (clickedpokemon: UsersPokemonExpanded) => Promise, 
 *    id?: number | undefined, 
 *    cardOptions: {evolvable?: boolean, selectable?: boolean, noXp?: boolean},
 *    selectedArray: Array<UsersPokemon | null>
 *    disabled?: boolean
 *    loadAllPokemons?: boolean
 * }} 
 */
const Collection = ({ cardClickEvent = undefined, id = undefined, cardOptions, selectedArray, disabled = false, loadAllPokemons = false }) => {
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
         const loaded = loadAllPokemons ? (await getAllPokemons()) : (await loadUserPokemons(id ?? info.id)) ?? [];
         setPokemons(loaded);
         setLoaded(true);
      })();
   }, [info, id, resetQuery, loadAllPokemons])

   if (loadAllPokemons) {
      cardOptions = cardOptions ?? {};
      cardOptions.noXp = true;
   }

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
                  disabled={disabled}
               />
            )
         )}
      </div>
   )
}

export default Collection