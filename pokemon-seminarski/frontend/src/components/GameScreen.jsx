import React, { useEffect, useState } from 'react'
import { socket } from './sockets/sockets';
import { useNavigate, useParams } from 'react-router-dom';
import Pokemon from './utils/Pokemon';
import { useAnimate } from 'framer-motion';
/**@typedef {import('../../../backend/game-logic/Player').SanitizedUser} Player*/

const GameScreen = () => {
   const navigate = useNavigate();
   const params = useParams();
   const [scope, animate] = useAnimate();
   const [loaded, setLoaded] = useState(false); // Loaded inital game state

   /**@type {[Player, React.Dispatch<React.SetStateAction<Player>>]} */
   const [enemy, setEnemy] = useState(undefined);
   /**@type {[Player, React.Dispatch<React.SetStateAction<Player>>]} */
   const [player, setPlayer] = useState(undefined);
   const [ourTurn, setOurTurn] = useState(undefined);
   const [isWaitingForServer, setisWaitingForServer] = useState(false);

   const [gameResult, setGameResult] = useState(null);
   const [gameOver, setGameOver] = useState(null);

   const handleAttack = async (move) => {
      if (ourTurn && isWaitingForServer) return;
      setisWaitingForServer(true);
      animate([
         ['.player-pokemon', { x: [-30, 150, 0], y: [-5, 50, 0] }, { duration: 1 }], // TODO
         ['.enemy-pokemon', { x: [20, -15, 0] }, { at: "-0.3" }]
      ]);
      socket.emit('game:action:attack', { attackId: move.id });
   }


   const handleChangePokemon = (newPokemonIndex) => {
      if (ourTurn && isWaitingForServer) return;
      setisWaitingForServer(true);
      socket.emit('game:action:switch', { pokemonIndex: newPokemonIndex });
   }
   const handleLeave = () => {
      socket.emit('game:action:leave');
   }

   useEffect(() => {
      function onConnectSuccess({ player, enemy, ourTurn }) {
         setPlayer(player);
         setEnemy(enemy)
         setOurTurn(ourTurn);
         setLoaded(true);
      }
      function onConnectFailed() {
         navigate('/home', { replace: true });
      }

      async function onUpdate({ player, enemy, actionResult, ourTurn }) {
         if (actionResult.type === 'attack' && ourTurn) { // ourTurn === true -> enemy attacked
            await animate([
               ['.enemy-pokemon', { x: [10, -120, 0], y: [5, -40, 0] }, { duration: 1 }], // TODO
               ['.player-pokemon', { x: [-30, 20, 0] }, { at: "-0.3" }]
            ]);
         }
         // ELSE 
         //    MI SMO NAPALI -> VEĆ OBRAĐENO (OURTURN === false)
         //    ZAMENILI SMO POKEMONA -> FRAMER MOTION RADI POSAO ZA UNMOUNT
         //    ZAMENILI SU POKEMONA -> -||-
         setPlayer(player);
         setEnemy(enemy);
         setisWaitingForServer(false);
      }
      function onEnd({ message }) {
         setGameResult(message);
         setGameOver(true);
      }
      function onConnectRedirect({ message, roomId }) {
         console.log(message); navigate(`/game/${roomId}`, { replace: true });
      }
      function onActionFailed({ message }) {
         console.error(message);
      }
      function onLeaveSuccess() {
         navigate('/home', { replace: true });
      }
      function onLeaveFailed({ message }) {
         console.error(message);
      }

      socket.on('game:connect:success', onConnectSuccess);
      socket.on('game:connect:redirect', onConnectRedirect);
      socket.on('game:connect:failed', onConnectFailed);
      socket.on('game:update', onUpdate);
      socket.on('game:action:failed', onActionFailed);
      socket.on('game:action:leave:success', onLeaveSuccess);
      socket.on('game:action:leave:failed', onLeaveFailed);
      socket.on('game:end', onEnd);
      socket.emit('game:connect', { roomId: params.id });
      return () => {
         socket.off('game:connect:success', onConnectSuccess);
         socket.off('game:connect:redirect', onConnectRedirect);
         socket.off('game:connect:failed', onConnectFailed);
         socket.off('game:update', onUpdate);
         socket.off('game:action:failed', onActionFailed);
         socket.off('game:action:leave:success', onLeaveSuccess);
         socket.off('game:action:leave:failed', onLeaveFailed);
         socket.off('game:end', onEnd);
      }
   }, [animate, navigate, params]);



   return (
      <div className='game'>
         {!loaded ? null : gameOver ? (
            <>
               <div className='game-over'>
                  <p>{gameResult}</p>
                  <button type='button' onClick={() => navigate('/home', { replace: true })}>go home</button>
               </div>
            </>
         ) : (
            <>
               <div className='enemy-header'>
                  <div className='enemy-header-group'>
                     <div className='enemy-name'>{enemy.username}</div>
                     <div className='enemy-pokemons'>
                        {enemy.pokemons.map(val => (
                           <div className='enemy-mini-pokemon' key={val.id}>
                              <img src={val.url} alt={val.name} />
                              {val.dead ? <div className='enemy-mini-pokemon-dead'><span className='x-bar' /><span className='x-bar' /></div> : null}
                           </div>
                        ))}
                     </div>
                  </div >
                  <div className='enemy-mana-pname-display'>
                     <img src={'mana' /**TODO */} alt='mana' />
                     <p className='enemy-pokemon-name'>{enemy.pokemons[enemy.selectedPokemonIndex].name}</p>
                  </div>
               </div >
               <div className='game-screen' ref={scope}>
                  <Pokemon player={enemy} isEnemy={true} />
                  <Pokemon player={player} />
               </div>
               <div className='game-option-menu'>
                  <div className='our-pokemon-name'><p className='pokemon-name'>{player.pokemons[player.selectedPokemonIndex]}</p></div>
                  <div className='out-pokemon-moves'>
                     {player.pokemons[player.selectedPokemonIndex].moves.map(m => (
                        <div className='our-pokemon-move' key={m.id} onClick={() => handleAttack(m)}>
                           <p className='our-pokemon-move-name'>{m.name}</p><div className='our-pokemon-moves-mana'><p >{m.mana}</p><img src={""/**TODO */} alt='mana' /></div>
                        </div >
                     ))}
                  </div>
                  <div className='our-game-info'>
                     <div className='our-health-points'>{/**TODO */}</div>
                     <div className='our-mana-points'>{/** */}</div>
                     <div className='our-pokemons'>
                        {player.pokemons.map(val => (
                           <div className='enemy-mini-pokemon' key={val.id} onClick={() => handleChangePokemon(val.id)}>
                              <img src={val.url} alt={val.name} />
                              {val.dead ? <div className='enemy-mini-pokemon-dead'><span className='x-bar' /><span className='x-bar' /></div> : null}
                           </div>
                        ))}
                     </div>
                     <div className='leave-game-button-wrapper'>
                        <button className='leave-game-button-wrapper' onClick={handleLeave}>leave game</button>
                     </div>
                  </div>
               </div>
            </>
         )
         }
      </div >
   )
}

export default GameScreen