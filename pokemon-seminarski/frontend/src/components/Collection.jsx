import React, { useContext, useEffect, useState } from 'react'
import API from './utils/API';
import { UserContext } from '../contexts/UserContextProvider';
import axios from 'axios';

const Collection = ({horizontal = false, onCardClickEvent = undefined,}) => {
  const { info } = useContext(UserContext);
  const [loaded, setLoaded] = useState(false);
  const [pokemonsData, setPokemonsData] = useState([]);
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    API.get(`/users/${info.id}/pokemons`).then((result) => {
      const data = result.data;
      setPokemonsData(data);
      //setLoaded(true);
    }).catch((err) => {
      console.error(err);
    });
  }, [info])

  useEffect(() => {
    if (pokemons.length === 0) {
      return;
    }
    (async () => {
      let temp = [];
      for await (const element of pokemons) {
        /** @type {} */
      }
    })();
  }, [pokemonsData]);

  return (
    <div className='collection'>
      {!loaded ? null :
        pokemons.map((pokemon) => {
          return (
            <div className='collection-pokemon'>

            </div>
          );
        })
      }
    </div>
  )
}

export default Collection