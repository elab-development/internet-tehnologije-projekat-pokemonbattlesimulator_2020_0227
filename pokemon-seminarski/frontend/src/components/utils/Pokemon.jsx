import { pokeGITAPI } from '../Collection';
import { AnimatePresence, motion } from 'framer-motion';
import ProgressBar from './ProgressBar';
import { getTypeName } from './pokemonTypes';

/**@param {number} typeID */
const getColor = (typeID, transparent = false) => typeID != null ? `var(--clr-${getTypeName(typeID)}${transparent ? "-transparent" : ""})` : "transparent";

const Pokemon = ({ player, isEnemy = false }) => {
    const pokemonIndex = player.selectedPokemonIndex;
    const pokemon = player.pokemons[pokemonIndex];

    console.log(isEnemy ? "ENEMY:" : "US:", player);
    console.log(pokemon.stats.hp / (pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp / 100))));

    return (
        <div className={`pokemon-container ${isEnemy ? 'enemy' : 'us'}`}>
            <div className='pokemon'>
                <div className='pokemon-podium'></div>
                <AnimatePresence>
                    {pokemonIndex < 0 ? null :
                        <motion.div
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
                <ProgressBar percent={100 * pokemon.stats.hp / (pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp / 100)))} fillColor={getColor(pokemon.type[0].id)} />
            </div>
        </div >
    )
};

export default Pokemon
