import React, { useEffect, useState } from 'react'
import PokemonCard from './utils/PokemonCard'
import Collection from './Collection'
import { socket } from './sockets/sockets';
import { useNavigate } from 'react-router-dom';
import './css/Auth/Play.scss'
import { useRef } from 'react';

const Play = () => {
   const navigate = useNavigate();
   /**@type {[Array<import('./Collection').UsersPokemon>, React.Dispatch<React.SetStateAction<import('./Collection').UsersPokemon[]>>]} */
   const [selectedPokemon, setSelectedPokemon] = useState(Array(3).fill(null));
   const [isSearching, setIsSearching] = useState(false);
   const isSearchingRef = useRef(isSearching);

   const areThreePokemonsSelected = selectedPokemon.every(p => p);

   const handleDeselect = async (pokemon) => {
      setSelectedPokemon(prev => {
         const index = prev.findIndex(p => p?.id === pokemon.id);
         if (index > -1) {
            const arr = [...prev];
            arr[index] = null;
            return arr;
         }
         return prev;
      });
   }
   /** @param {import('./Collection').UsersPokemon} pokemon*/
   const handleSelect = async (pokemon) => {
      const indexToDeselect = selectedPokemon.findIndex(p => p && p.id === pokemon.id);
      setSelectedPokemon(prev => {
         const copy = [...prev];
         if (indexToDeselect > -1) {
            copy[indexToDeselect] = null;
            return copy;
         }

         const firstEmptyIndex = copy.findIndex(p => p == null);
         if (firstEmptyIndex > -1) {
            copy[firstEmptyIndex] = pokemon;
            return copy;
         }

         return prev;
      })
   }
   const handleFind = () => {
      if (!areThreePokemonsSelected) return;
      if (isSearching) socket.emit('game:queue:leave');
      else socket.emit('game:queue:join', { pokemons: selectedPokemon.map((val) => val.id) });
   }

   useEffect(() => {
      isSearchingRef.current = isSearching;
   }, [isSearching])

   useEffect(() => {
      function onSuccessJoinQueue({ message }) {
         console.log("joined a queue", message);
         setIsSearching(true);
      }
      function onFoundGame({ id }) {
         console.log("found a game:", id);
         navigate(`/game/${id}`);
      }
      function onCancelGame(error) {
         console.error(error);
         setIsSearching(false);
      }

      socket.on('game:queue:found', onFoundGame);                   // Successfully joined the queue and found the game
      socket.on('game:queue:join:success', onSuccessJoinQueue);     // Successfully joined the game search
      socket.on('game:queue:join:failed', onCancelGame);            // Coudln't join queue cause of given reason
      socket.on('game:queue:leave:success', onCancelGame);          // Successfully exited game search
      socket.on('game:queue:leave:failed', onCancelGame);           // Couldn't exit game search
      return () => {
         if (isSearchingRef.current) socket.emit('game:queue:leave');

         socket.off('game:queue:found', onFoundGame);
         socket.off('game:queue:join:failed', onCancelGame);
         socket.off('game:queue:join:success', onSuccessJoinQueue);
         socket.off('game:queue:leave:success', onCancelGame);
         socket.off('game:queue:leave:failed', onCancelGame);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className='play-page'>
         <div className='find-game-button'>
            <button className='button-full' onClick={handleFind} disabled={!areThreePokemonsSelected}>
               {isSearching ? <span><i className="bi bi-x"></i> Cancel Search</span> : <span><i className="bi bi-search"></i> Find Opponent</span>}
            </button>
         </div>
         <div className='chosen-pokemons-wrapper'>
            <h3>Chosen Pokemons</h3>
            <div className='chosen-pokemons'>
               {selectedPokemon.map((pokemon, idx) => (pokemon ?
                  <PokemonCard pokemon={pokemon} onClick={handleDeselect} key={idx} options={{ deselectable: true }} disabled={isSearching}/>
                  : <PlaceHolderPokemon key={idx} />
               ))}
            </div>
         </div>
         <hr />
         <div className='collection-wrapper'>
            <h3>Your Pokemons</h3>
            <Collection horizontal={true} cardClickEvent={handleSelect} cardOptions={{ selectable: true }} selectedArray={selectedPokemon} disabled={isSearching}/>
         </div>
      </div>
   )
}

const PlaceHolderPokemon = () => (
   <div className='pokemon-card-placeholder'>
      <div>
         <svg width="33" height="54" viewBox="0 0 33 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M19.0033.612004c2.281.611296 4.3539 1.541566 6.1506 2.744676 1.7957 1.20295 3.2763 2.63888 4.4473 4.34962 1.1721 1.71091 1.9417 3.606 2.2887 5.7008.3735 2.0786.2123 4.2782-.399 6.5592-1.0944 4.0836-2.944 6.9644-5.6124 8.6708-2.6417 1.6893-5.8425 2.423-9.6246 2.2004l-.3511 1.3102c-.2793 1.0419-.7699 1.9139-1.4412 2.5958-.6435.6651-1.4496 1.0962-2.3758 1.3366-.8977.2246-1.836.2101-2.83446-.0575-.99942-.2678-1.838-.7294-2.52575-1.379-.65923-.6652-1.10122-1.4309-1.34762-2.3344-.21862-.9204-.1887-1.9159.0905-2.9578l1.43649-5.3602c.29692-1.1079.73311-1.9385 1.34598-2.4024.61312-.4649 1.28597-.6948 1.99526-.7374.7103-.0423 1.7661-.0163 3.1334.0942 3.5569.2775 5.6987-.9747 6.4438-3.755.3027-1.1296.0944-2.2662-.5797-3.4007-.6454-1.151-1.702-1.9037-3.1572-2.2937-1.3468-.3609-2.4781-.3892-3.4-.0779-.8993.3173-1.8362.8932-2.86468 1.6888-.99973.7789-1.93622 1.3337-2.77164 1.6692-.80665.3189-1.80639.3048-2.97946-.0096-1.325-.3551-2.30283-1.1691-2.99029-2.4235-.660652-1.2715-.803605-2.565-.436883-3.93342C1.28366 6.02123 2.61751 4.11784 4.66449 2.73381 6.71136 1.35016 9.0213.496169 11.6225.169028c2.6023-.326977 5.0574-.1796861 7.3808.442976ZM7.6124 41.8107c1.02015.2734 1.89944.8041 2.6447 1.5865.7444.7811 1.2291 1.6755 1.5055 2.7277.3041 1.0354.3187 2.0819.0395 3.1238-.2853 1.0645-.8313 2.001-1.6185 2.7682-.75945.7503-1.63513 1.24-2.68734 1.5163-1.02952.2825-2.03257.2886-3.03101.021-.99943-.2678-1.88374-.7797-2.65674-1.5452-.75031-.7594-1.304213-1.6322-1.609341-2.6678-.2763545-1.0522-.2621251-2.1313.023163-3.1958.279206-1.0419.796418-1.9459 1.555838-2.6962.78818-.7669 1.71436-1.2833 2.74969-1.5874 1.03659-.3049 2.06341-.3247 3.08454-.0511Z" fill="#4A3E65" />
         </svg>
      </div>
   </div>
)

export default Play