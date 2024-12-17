import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import API from './utils/api/API';
import Collection, { loadApiData } from './Collection';
import { useNavigate } from 'react-router-dom';
import { splitCamelCase } from './CareerWrapper';



const Career = () => {
   const navigate = useNavigate();
   const ctx = useContext(UserContext);
   const [{ stats, ...user }, setUser] = useState(structuredClone(ctx.info));
   const [loaded, setLoaded] = useState({ stats: false });

   /** @param {import('./Collection').UsersPokemonExpanded} pokemon @param {React.Dispatch<React.SetStateAction<import('./Collection').UsersPokemonExpanded[]>>} callback*/
   const handleEvolve = async (pokemon, callback) => {
      if (!pokemon.canEvolve) {
         return;
      }
      const data = await API.patch(`/users/${ctx.info.id}/pokemons/${pokemon.id}`); // CALLS OUR EVOLVE API TODO
      const fullPokemon = await loadApiData(pokemon.id);
      callback(prev => prev.map(p => p.id === data.data ? { ...data.data, ...fullPokemon } : { ...p })); // UPDATES THE POKEMONS TO REFLECT
   }

   useEffect(() => {
      async function loadStats() {
         try {
            const statsData = await API.get(`/users/${ctx.info.id}?populate=y`);
            setUser(prev => ({ ...prev, stats: statsData.data.stats }));
            setLoaded(prev => ({ ...prev, stats: true }));
         } catch (error) {
            console.error(error);
         }
      }
      loadStats();
   }, [ctx.info.id]);


   return (
      <div className='carrer'>
         <div className='carrer-info-wrapper'>
            <div className='carrer-setting-button-wrapper' onClick={navigate('/settings', { replace: true })}>
               <img src='carrer-setting-icon' alt="settings-icon" /><span className='carrer-setting-text'>setting</span>
            </div>
            <div className='carrer-setting-table'>
               {!loaded.stats ? null :
                  <table>
                     <thead>
                        <tr>
                           <th colSpan={"2"}>Stats</th>
                        </tr>
                     </thead>
                     <tbody>
                        {Object.keys({ ...user, ...stats }).map((stat) => (
                           <tr key={stat}>
                              <td>{splitCamelCase(stat)}</td>
                              <td>{user[stat] || stats[stat]}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               }
            </div>
            <Collection onCardClickEvent={handleEvolve} cardOptions={{ evolvable: true }} />
         </div>
      </div>
   )
}

export default Career