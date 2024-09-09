import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import API from './utils/API';
import Collection from './Collection';

/**@param {string} str  */
function splitCamelCase(str) {
   return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

const Career = () => {
   const ctx = useContext(UserContext);
   const [{ stats, ...user }, setUser] = useState(structuredClone(ctx.info));
   const [loaded, setLoaded] = useState({ stats: false });

   /** @param {import('./Collection').UsersPokemon} pokemon */
   const handleEvolve = async (pokemon) => {
      const data = await API.patch(`/users/${ctx.info.id}/pokemons/${pokemon.id}`);
      return data.data;
   }

   useEffect(() => {
      async function loadStats() {
         try {
            const statsData = await API.get(`/users/${ctx.info.id}`);
            setUser(prev => ({ ...prev, stats: statsData.data.stats }));
            setLoaded(prev => ({ ...prev, stats: true }));
         } catch (error) {
            console.error(error);
         }
      }
      loadStats();
   }, []);


   return (
      <div className='carrer'>
         <div className='carrer-info-wrapper'>
            <div className='carrer-setting-button-wrapper'>
               <img src='carrer-setting-icon' /><span className='carrer-setting-text'>setting</span>
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
                        {Object.keys({...user, ...stats}).map((stat) => (
                           <tr key={stat}>
                              <td>{splitCamelCase(stat)}</td>
                              <td>{user[stat] || stats[stat]}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               }
            </div>
            <Collection onCardClickEvent={handleEvolve} />
         </div>
      </div>
   )
}

export default Career