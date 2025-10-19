import React, { useEffect, useState } from 'react'
import { socket } from './sockets/sockets';
import { useNavigate, useParams } from 'react-router-dom';
import Pokemon from './utils/Pokemon';
import { useAnimate } from 'framer-motion';
import './css/Game/GameScreen.scss'
import { loadApiData } from './Collection';
import { useRef } from 'react';
/**@typedef {import('../../../backend/game-logic/Player').SanitizedUser} Player*/

/** @param {number} id */
const getSmallPokemonImage = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

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
   const [gameOver, setGameOver] = useState(false);

   /** @type {React.MutableRefObject<HTMLDivElement>}*/
   const playerPokemonRef = useRef(null);

   /** @type {React.MutableRefObject<HTMLDivElement>}*/
   const enemyPokemonRef = useRef(null);

   /**@param {'us' | 'enemy'} attacker */
   const animateAttack = (attacker) => {
      const usEl = playerPokemonRef.current;
      const enemyEl = enemyPokemonRef.current;
      if (!usEl || !enemyEl) { console.error("Couldn't calc, data is missing", playerPokemonRef, enemyPokemonRef); return; }

      const usRect = usEl.getBoundingClientRect();
      const enemyRect = enemyEl.getBoundingClientRect();

      const usCenter = {
         x: usRect.left + usRect.width / 2,
         y: usRect.top + usRect.height / 2
      }

      const enemyCenter = {
         x: enemyRect.left + enemyRect.width / 2,
         y: enemyRect.top + enemyRect.height / 2
      }

      const isUs = attacker === "us";
      const from = isUs ? usCenter : enemyCenter;
      const to = isUs ? enemyCenter : usCenter;

      const dx = to.x - from.x;
      const dy = to.y - from.y;

      const attackX = dx * 0.4;
      const attackY = dy * 0.4;

      const attackerEl = isUs ? usEl : enemyEl;
      const targetEl = isUs ? enemyEl : usEl;

      animate([
         [
            attackerEl,
            { x: [0, attackX, 0], y: [0, attackY, 0] },
            { duration: 1, ease: "easeInOut" }
         ],
         [
            targetEl,
            { x: [0, 40, -20, 0] },
            { duration: 0.6, ease: [0.68, -0.55, 0.27, 1.55], at: '-0.4' }
         ]
      ]);
   }

   const handleAttack = async (move) => {
      if (ourTurn && isWaitingForServer) return;
      setisWaitingForServer(true);

      animateAttack("us");

      //socket.emit('game:action:attack', { attackId: move.id });
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
         console.log("connected successfully to the game!")
         console.log("Data we got: ", "player: ", player, "\nenemy:", enemy, "\nourTurn: ", ourTurn);

         // populate pokemons
         const playerPokemons = player.pokemons.map(async (p) => {
            const additionalData = await loadApiData(p.id, false);
            return { ...p, ...additionalData }
         });

         const enemyPokemons = enemy.pokemons.map(async (p) => {
            const additionalData = await loadApiData(p.id, false);
            /**@type {{}} */
            return { ...p, ...additionalData }
         });

         Promise.all([
            Promise.all(playerPokemons).then((pokemons) => {
               setPlayer({
                  ...player,
                  pokemons: pokemons
               });
            }),
            Promise.all(enemyPokemons).then((pokemons) => {
               setEnemy({
                  ...enemy,
                  pokemons: pokemons,
               })
            })
         ]).then(() => {
            setOurTurn(ourTurn);
            setLoaded(true);
         })

      }
      function onConnectFailed({ message } = {}) {
         console.log("Couldnt connect :(", message);
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

      try {
         socket.emit('game:connect', { roomId: parseInt(params.id) });
      } catch (error) {
         console.error("invalid route");
         navigate('/home', { replace: true });
      }
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
            <div className='game-over'>
               <p>{gameResult}</p>
               <button className='button-full' type='button' onClick={() => navigate('/home', { replace: true })}>go home</button>
            </div>
         ) : (
            <>
               <div className='enemy-header'>
                  <div className='enemy-header-group'>
                     <div className='enemy-name'>{enemy.username}</div>
                     <div className='enemy-header-spacer'><i className="bi bi-dot"></i></div>
                     <div className='enemy-pokemons'>
                        {enemy.pokemons.map(val => (
                           <div className='enemy-mini-pokemon' key={val.id}>
                              <img src={getSmallPokemonImage(val.id)} alt={val.name} />
                              {val.stats.hp === 0 && <div className='pokemon-dead'><span className='x-bar' /><span className='x-bar' /></div>}
                           </div>
                        ))}
                     </div>
                  </div >
                  <div className='enemy-empty-header-custom-border' />
                  <div className='enemy-mana-pname-display'>
                     <div className='mana'><i className="bi bi-flask"></i> <i className="bi bi-chevron-double-right"></i> <code>{String(enemy.mana).padStart(2, "0")}</code></div>
                  </div>
               </div>
               <div className='game-screen' ref={scope}>
                  <Pokemon player={enemy} isEnemy={true} ref={enemyPokemonRef} />
                  <Pokemon player={player} ref={playerPokemonRef} />
               </div>
               <div className='game-option-menu'>
                  <div className='game-option-wrapper'>
                     <div className='our-pokemon-moves-wrapper'>
                        <h3>Our pokemon moves</h3>
                        <div className='our-pokemon-moves'>
                           {player.pokemons[player.selectedPokemonIndex].moves.map(m => (
                              <div className='our-pokemon-move' key={m.id} onClick={() => handleAttack(m)}>
                                 <p className='our-pokemon-move-name'>
                                    <span aria-hidden="true" style={{ background: `var(--pic-${m.type.name})` }} /> {m.name}
                                 </p>
                                 <div className='our-pokemon-info-wrap'>
                                    <div className='our-pokemon-stat-info'>
                                       <p><code>{String(Math.round(m.atk)).padStart(3, "0")}</code></p>
                                       <p> DMG</p>
                                    </div>
                                    <div className='our-pokemon-stat-info'>
                                       <p><code>{String(Math.round(m.mana)).padStart(2, "0")}</code></p>
                                       <p> MNA</p>
                                    </div>
                                 </div>
                              </div >
                           ))}
                        </div>
                     </div>
                     <div className='our-game-info'>
                        <div className='our-mana-points'>
                           <i className="bi bi-flask"></i> <i className="bi bi-chevron-double-right"></i> <code>{String(player.mana).padStart(2, "0")}</code>
                        </div>
                        <div className='our-pokemons-wraper'>
                           <h4>Change pokemon</h4>
                           <div className='our-pokemons'>
                              {player.pokemons.map(val => (
                                 <div className='mini-pokemon' key={val.id} onClick={() => handleChangePokemon(val.id)}>
                                    <img src={getSmallPokemonImage(val.id)} alt={val.name} />
                                    {val.stats.hp === 0 && <div className='pokemon-dead'><span className='x-bar' /><span className='x-bar' /></div>}
                                 </div>
                              ))}
                           </div>
                        </div>
                        <div className='skip-btn-wrapper'>
                           <button className='button-full' >skip move</button>
                        </div>
                        <div>
                           <button className='button-full' onClick={handleLeave} type='button'>leave game</button>
                        </div>
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