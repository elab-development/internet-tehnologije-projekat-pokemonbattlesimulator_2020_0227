import React, { useEffect, useState } from 'react'
import { socket } from './sockets/sockets';
import { useNavigate } from 'react-router-dom';
import Pokemon from './utils/Pokemon';

const GameScreen = () => {
  const navigate = useNavigate();
  const [enemy, setEnemy] = useState(undefined);
  const [player, setPlayer] = useState(undefined);
  const [loaded, setLoaded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const [gameResult, setGameResult] = useState(null);
  const [gameOver, setGameOver] = useState(null);

  const handleAttack = (move) => {
    if (isAnimating) return;
    setIsAnimating(true);
    socket.emit('game:action:attack', { move });
  }

  const handleChangePokemon = (newPokemonIndex) => {
    if (isAnimating) return;
    setIsAnimating(true);
    socket.emit('game:action:changePokemon', { newPokemonIndex });
  }

  useEffect(() => {
    function onConnectSuccess({ player, enemy }) {
      setPlayer(player);
      setEnemy(enemy)
      setLoaded(true);
    }
    function onConnectFailed() {
      navigate('/home', { replace: true });
    }
    function onUpdate({ player, enemy, actionResult }) {
      setPlayer(player);
      setEnemy(enemy);
      setIsAnimating(false);
      setActionResult(actionResult);
    }
    function onEnd({ winner, message }) {
      setGameResult({ winner, message });
      setGameOver(true);
    }


    socket.on('game:connect:success', onConnectSuccess);
    socket.on('game:connect:failure', onConnectFailed);
    socket.on('game:update', onUpdate);
    socket.on('game:end', onEnd);

    return () => {
      socket.off('game:connect:success', onConnectSuccess);
      socket.off('game:connect:failure', onConnectFailed);
      socket.off('game:update', onUpdate);
      socket.off('game:end', onEnd);
    }
  }, []);


  return (
    <div className='game'>
      {!loaded ? null : gameOver ? (
        <>
          <div className='game-over'>
            <p>{gameResult.message}</p>
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
              <p className='enemy-pokemon-name'>{enemy.selectedPokemon.name}</p>
            </div>
          </div >
          <div className='game-screen'>
            <Pokemon actinoResult={actionResult} player={enemy} isEnemy={true} />
            <Pokemon actinoResult={actionResult} player={player} />
          </div>
          <div className='game-option-menu'>
            <div className='our-pokemon-name'><p className='pokemon-name'>{player.pokemons[player.selectedPokemon]}</p></div>
            <div className='out-pokemon-moves'>
              {player.pokemons[player.selectedPokemon].moves.map(m => (
                <div className='our-pokemon-move' key={m.id} onClick={() => handleAttack(m)}>
                  <p className='our-pokemon-move-name'>{m.name}</p><div className='our-pokemon-moves-mana'><p >{m.manaCost}</p><img src={""/**TODO */} alt='mana' /></div>
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
            </div>
          </div>
        </>
      )
      }

    </div >
  )
}

export default GameScreen