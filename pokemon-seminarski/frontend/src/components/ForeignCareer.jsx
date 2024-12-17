import React, { useEffect, useState } from 'react'
import { splitCamelCase } from './CareerWrapper';
import Collection from './Collection';
import { useParams } from 'react-router-dom';
import API from './utils/api/API';

const ForeignCareer = () => {
   const params = useParams();
   const [loaded, setLoaded] = useState(false);
   const [userData, setUserData] = useState(undefined);
   const [notFound, setNotFound] = useState(undefined);

   useEffect(() => {
      async function loadUser() {
         try {
            const statsData = await API.get(`/users/${params.id}?populate=y`);
            const { stats, ...user } = statsData.data;
            setUserData({ ...user, ...stats });
            setLoaded(true);
         } catch (error) {
            console.error(error);
            if (error.response.status === 404) {
               setNotFound(true)
               setLoaded(true);
            }
         }
      }
      loadUser();
   }, [params])

   return (
      <>
         {!loaded ? null : notFound != null && notFound ? <div className='not-found'>Not Found</div> :
            <div className='carrer'>
               <div className='carrer-info-wrapper'>
                  <div className='carrer-setting-table'>
                     <table>
                        <thead>
                           <tr>
                              <th colSpan={"2"}>Stats</th>
                           </tr>
                        </thead>
                        <tbody>
                           {Object.keys(userData).map((stat) => (
                              <tr key={stat}>
                                 <td>{splitCamelCase(stat)}</td>
                                 <td>{userData[stat]}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  <Collection cardOptions={{ evolvable: false }} />
               </div>
            </div>
         }
      </>
   )
}

export default ForeignCareer