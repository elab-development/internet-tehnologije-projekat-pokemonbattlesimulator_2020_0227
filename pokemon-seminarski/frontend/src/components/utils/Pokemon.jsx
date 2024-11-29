import React, { useEffect, useState } from 'react'
import { pokeGITAPI } from '../Collection';
import { AnimatePresence, motion } from 'framer-motion';

/**@param {{player: import('../GameScreen').Player, actionResult: import('../../../../backend/event-handlers-v2/gameHandler').ActionResult, isEnemy: boolean}} arg0 */
const Pokemon = ({ player, isEnemy = false }) => {
    const [pokemonIndex, setPokemonIndex] = useState(player.selectedPokemonIndex);
    const [pokemon, setPokemon] = useState(player.pokemons[pokemonIndex]);

    useEffect(() => {
        if (player.selectedPokemonIndex !== pokemonIndex) {
            setPokemonIndex(player.selectedPokemonIndex);
            setPokemon(player.pokemons[player.selectedPokemonIndex]);
        }
    }, [player, pokemonIndex])

    return (
        <div className={`pokemon-continer ${isEnemy ? 'enemy' : 'us'}`}>
            <div className='pokemon'>
                <AnimatePresence>
                    {pokemonIndex < 0 ? null :
                        <motion.div
                            className={`${isEnemy ? 'enemy-pokemon' : 'player-pokemon'}`}
                            key={pokemonIndex}
                            initial={{ opacity: 0, x: isEnemy ? 20 : -20, y: isEnemy ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: isEnemy ? 30 : -30, y: isEnemy ? 30 : -30 }}
                        >
                            <img src={pokeGITAPI(pokemon.id)} alt='pokemon' />
                        </motion.div>
                    }
                </AnimatePresence>
                <div className='pokemon-podium'></div>
            </div>
            <p className='pokemon-hp'>HP: {pokemon.hp}</p>
        </div >
    )
}

export default Pokemon
