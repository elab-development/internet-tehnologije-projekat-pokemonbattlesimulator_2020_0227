import React, { useEffect, useState } from 'react'
import PokemonCard from './utils/PokemonCard'
import Collection from './Collection'
import { socket } from './sockets/sockets';
import { useNavigate } from 'react-router-dom';

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
      if (selectedPokemon.length !== 3) return;
      socket.emit('game:queue:join', { pokemons: selectedPokemon.map((val) => val.id) });
   }

   const handleCanel = () => {
      socket.emit('game:queue:leave');
   }

   useEffect(() => {
      function onSuccessJoinQueue({ message }) {
         setIsSearching(true);
      }
      function onFoundGame(id) {
         navigate(`/game/${id}`, { replace: true });
      }
      function onCancelGame() {
         setIsSearching(false);
      }

      socket.on('game:queue:found', onFoundGame);                                      // Successfully joined the queue and found the game
      socket.on('game:queue:join:success', onSuccessJoinQueue);                         // Successfully joined the game search
      socket.on('game:queue:join:failed', ({ message }) => console.error(message));    // Coudln't join queue cause of given reason
      socket.on('game:queue:leave:success', onCancelGame);                             // Successfully exited game search
      socket.on('game:queue:leave:failed', ({ message }) => console.error(message));   // Couldn't exit game search
      return () => {
         socket.off('game:queue:found', onFoundGame);
         socket.off('game:queue:join:failed');
         socket.off('game:queue:join:success', onSuccessJoinQueue);
         socket.off('game:queue:leave:success', onCancelGame);
         socket.off('game:queue:leave:failed');
      }
   }, [navigate]);

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
                  <button className='button' onClick={handleFind} disabled={selectedPokemon.length !== 3}>play</button>
               </div>
               <Collection horizontal={true} cardClickEvent={handleSelect} />
            </>
         )
         }
      </div>
   )
}

export default Play