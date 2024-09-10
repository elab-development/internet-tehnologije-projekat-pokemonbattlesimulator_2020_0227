import React, { useEffect } from 'react'
import { pokeGITAPI } from '../Collection';

const Pokemon = ({ player, isAnimating, actinoResult, isEnemy = false }) => {
    const [pokemonIndex, setPokemonIndex] = useState(player.selectedPokemon);
    const [pokemon, setPokemon] = useState(player.pokemons[pokemonIndex]);
    const [animationState, setAnimationState] = useState('idle');

    useEffect(() => {
        if (actinoResult) {
            const { type, attacking, damage, newPokemonIndex } = actinoResult;

            if (type === 'changePokemon' && newPokemonIndex !== pokemonIndex) {
                setAnimationState('exit');
                setTimeout(() => {
                    setPokemonIndex(newPokemonIndex);
                    setPokemon(player.pokemons[newPokemonIndex]);
                    setAnimationState('enter');
                }, 1000);
            }
            if (type === 'attack') {
                if (attacking) {
                    setAnimationState('attack');
                } else {
                    setAnimationState('damage');
                }
                setTimeout(() => setAnimationState('idle'), 1000);
            }
        }

    }, [])

    return (
        <div className={`pokemon-continer ${isEnemy ? 'enemy' : ""}`}>
            <div className='pokemon'>
                <img className={'pokemon-picture ' + animationState} src={pokeGITAPI(pokemon.id)} />
                <div className='pokemon-podium'></div>
            </div>
            <p className='pokemon-hp'>HP: {pokemon.hp}</p>
        </div>
    )
}

export default Pokemon
