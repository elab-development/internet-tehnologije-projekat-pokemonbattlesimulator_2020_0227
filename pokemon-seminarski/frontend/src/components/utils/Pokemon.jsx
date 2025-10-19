import React, { useEffect, useState } from 'react'
import { pokeGITAPI } from '../Collection';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import { getTypeName } from './pokemonTypes';
import { forwardRef } from 'react';

/**@param {number} typeID */
const getColor = (typeID, transparent = false) => typeID != null ? `var(--clr-${getTypeName(typeID)}${transparent ? "-transparent" : ""})` : "transparent";

/**@param {{player: import('../GameScreen').Player, actionResult: import('../../../../backend/event-handlers-v2/gameHandler').ActionResult, isEnemy: boolean}} arg0 */
const Pokemon = forwardRef(({ player, isEnemy = false }, ref) => {
    const [pokemonIndex, setPokemonIndex] = useState(player.selectedPokemonIndex);
    const [pokemon, setPokemon] = useState(player.pokemons[pokemonIndex]);

    useEffect(() => {
        if (player.selectedPokemonIndex !== pokemonIndex) {
            setPokemonIndex(player.selectedPokemonIndex);
            setPokemon(player.pokemons[player.selectedPokemonIndex]);
        }
    }, [player, pokemonIndex])

    return (
        <div className={`pokemon-container ${isEnemy ? 'enemy' : 'us'}`}>
            <div className='pokemon'>
                <div className='pokemon-podium'></div>
                <AnimatePresence>
                    {pokemonIndex < 0 ? null :
                        <motion.div
                            ref={ref}
                            className={`pokemon-image ${isEnemy ? "enemy-img" : "us-img"}`}
                            key={pokemonIndex}
                            initial={{ opacity: 0, x: isEnemy ? 20 : -20, y: isEnemy ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: isEnemy ? 30 : -30, y: isEnemy ? 30 : -30 }}
                        >
                            <img src={pokeGITAPI(pokemon.id)} alt='pokemon' />
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
            <p className='pokemon-name'>{pokemon.name}n</p>
            <div className='health-bar'>
                <ProgressBar percent={pokemon.stats.hp / pokemon.baseStats.hp} fillColor={getColor(pokemon.type[0].id)} />
            </div>
        </div >
    )
});

export default Pokemon
