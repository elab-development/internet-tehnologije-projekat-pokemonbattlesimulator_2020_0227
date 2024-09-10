import React, { useEffect, useState } from 'react'
import PokemonCard from './utils/PokemonCard'
import Collection from './Collection'
import { socket } from './sockets/sockets';
import { replace, useNavigate } from 'react-router-dom';

const Play = () => {
   const navigate = useNavigate();
   const [selectedPokemon, setSelectedPokemon] = useState([]);
   const [isSearching, setIsSearching] = useState(false);

   const handleDeselect = (pokemon) => {
      setSelectedPokemon(prev => prev.filter((val) => val.id !== pokemon.id));
   }
   /** @param {import('./Collection').UsersPokemon} pokemon, @param {React.Dispatch<React.SetStateAction<import('../../../backend/utils/typedefs').PokemonTable[]>>} callback*/
   const handleSelect = (pokemon, callback) => {
      if (selectedPokemon.length === 3 || selectedPokemon.some(p => p.id === pokemon.id)) return;
      setSelectedPokemon(prev => [...prev, pokemon]);
   }

   const handleFind = () => {
      socket.emit('game:find', { pokemons: selectedPokemon });
      setIsSearching(true);
   }

   const handleCanel = () => {
      socket.emit('game:cancel');
   }

   useEffect(() => {
      function onFoundGame(id) {
         navigate(`/game/${id}`, { replace: true });
      }
      function onCancelGame() {
         setIsSearching(false);
      }

      socket.on('game:found', onFoundGame);
      socket.on('game:cancel', onCancelGame);
      return () => {
         socket.off('game:found', onFoundGame);
         socket.off('game:cancel', onCancelGame);
      }
   }, []);

   return (
      <div className='choose-pokemon-screen'>
         {isSearching ? (
            <div className='play-waiting'>
               <div className='frog-waiting'>
                  <img src="" alt="frog-gif" /> {/**TODO */}
               </div>
               <p className='play-waiting-text'>waiting for someone to join...</p>
               <button type='button' onClick={handleCanel}></button>
            </div>) : (
            <>
               <div className='chosen-pokemon'>
                  <div className='pokemon-card-placeholder'>{selectedPokemon[0] != null ? <PokemonCard pokemon={selectedPokemon[0]} onClick={handleDeselect} /> : null}</div>
                  <div className='pokemon-card-placeholder'>{selectedPokemon[1] != null ? <PokemonCard pokemon={selectedPokemon[1]} onClick={handleDeselect} /> : null}</div>
                  <div className='pokemon-card-placeholder'>{selectedPokemon[2] != null ? <PokemonCard pokemon={selectedPokemon[2]} onClick={handleDeselect} /> : null}</div>
               </div>
               <div className='find-game-button'>
                  <button className='button' onClick={handleFind}>play</button>
               </div>
               <Collection horizontal={true} cardClickEvent={handleSelect} />
            </>
         )
         }
      </div>
   )
}

export default Play