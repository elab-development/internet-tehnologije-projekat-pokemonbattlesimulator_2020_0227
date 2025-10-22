import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import API from './utils/api/API';
import Collection from './Collection';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingPage from './LoadingPage';
import CopyUrlButton from './utils/CopyUrlButton';
import NotFound from './utils/NotFound';
import './css/Auth/Career.scss'
import { RootContext } from '../contexts/RootContextProvider';
import { ADMIN } from './utils/roles';
import { muteUser } from './utils/api/services/userServices';

function splitCamelCase(str) {
   return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

function isInteger(str) {
   return /^\d+$/.test(str);
}

const Career = () => {
   const navigate = useNavigate();
   const params = useParams();
   const { info } = useContext(UserContext);
   const { logout } = useContext(RootContext);
   const [{ stats, ...user }, setUser] = useState({});
   const [loaded, setLoaded] = useState({ stats: false });
   const isOurProfile = (isInteger(params.id) && Number(params.id) === info.id) || params.id === info.username;
   const [userMuteLoading, setUserMuteLoading] = useState(false);


   /** @param {import('./Collection').UsersPokemonExpanded} pokemon @param {React.Dispatch<React.SetStateAction<import('./Collection').UsersPokemonExpanded[]>>} callback*/
   const handleEvolve = async (pokemon, callback) => {
      console.log("handleEvolve");
      if (!pokemon.canEvolve) {
         console.log("coudln't evolve :(");
         return;
      }
      try {
         await API.put(`/users/${params.id}/pokemons/${pokemon.id}`);
      } catch (error) {
         console.error("Couldn't evolve the pokemone :(", error);
      }
   }

   const handleMute = async () => {
      if (info.id === user.id || userMuteLoading) return;

      console.count("hadnleMute");
      setUserMuteLoading(true)
      muteUser(user.id, !user.isMuted)
         .then(() => {
            user.isMuted = !user.isMuted;
            setUser({...user, ...stats});
         }).catch((err) => {
            console.error(err)
         }).finally(() => {
            setUserMuteLoading(false)
         });
   }

   useEffect(() => {
      async function loadStats() {
         try {
            const userData = (await API.get(`/users/${params.id}?populate=y`)).data;
            userData.createdAt = new Date(userData.createdAt).toLocaleString("de-DE");
            userData.updatedAt = new Date(userData.updatedAt).toLocaleString("de-DE");
            setUser(userData);
         } catch (error) {
            console.error(error);
         } finally {
            setLoaded(prev => ({ ...prev, stats: true }));
         }
      }
      loadStats();
   }, [params.id]);

   if (!loaded.stats) {
      return <LoadingPage />
   }

   if (!user.id) {
      return <NotFound />
   }

   return (
      <div className='career'>
         <div className='career-info'>
            <div className='toolbar'>
               {isOurProfile &&
                  <>
                     <button className="button-full" onClick={() => navigate(`/users/${params.id}/edit`)} type='button'>
                        <i className="bi bi-pencil"></i> <span>Edit Profile</span>
                     </button>
                     <button className="button-full" onClick={logout} type='button'>
                        <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
                     </button>
                     {info.role === ADMIN &&
                        <button className='button-full' onClick={() => navigate(`/admin`)} type='button'>
                           <i className="bi bi-bullseye"></i> <span>Admin Page</span>
                        </button>
                     }
                  </>
               }
               {!isOurProfile &&
                  <>
                     <button className='button-full' onClick={handleMute} type='button' disabled={userMuteLoading}>
                        {(user.isMuted ?? false) ? (
                           <>
                              <i className="bi bi-ban-fill"></i> <span>Unmute user</span>
                           </>
                        ) : (
                           <>
                              <i className="bi bi-ban"></i> <span>Mute user</span>
                           </>
                        )}

                     </button>
                  </>
               }
               <CopyUrlButton />
            </div>
            <table className='stats-table'>
               <thead>
                  <tr>
                     <th colSpan="2">Stats</th>
                  </tr>
               </thead>
               <tbody>
                  {Object.keys({ ...user, ...stats }).map((stat) => (
                     <tr key={stat}>
                        <td>{splitCamelCase(stat)}</td>
                        <td>{String(user[stat] ?? stats[stat])}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className='collection-wrapper'>
            <h3>Collection</h3>
            <Collection cardClickEvent={handleEvolve} cardOptions={{ evolvable: isOurProfile }} id={user.id} />
         </div>
      </div >
   )
}

export default Career