import React from 'react'
import ProgressBar from './ProgressBar'
import { getTypeName } from './pokemonTypes'
import { pokeGITAPI } from '../Collection'

/** 
 * @param {{pokemon: import('../Collection').UsersPokemonExpanded, onClick: (pokemon: import('../Collection').UsersPokemonExpanded) => any, options: {evolvable?: boolean, selectable?: boolean}}} param0 
 */
const PokemonCard = ({ pokemon, onClick, options: { evolvable = false, selectable = false } }) => {

    const handleClick = () => {
        onClick(pokemon);
    }

    return (
        <div className={`pokemon-card${evolvable && pokemon.canEvolve ? " pokemon-card-evolvable" : ""}`} onClick={handleClick}>
            <h3 className='pokemon-card-title'>#{String(pokemon.id).padStart(3, "0")} - {pokemon.name}</h3>
            <div className='pokemon-card-picture'>
                <img src={pokeGITAPI(pokemon.id)} alt='pokemon-image' />
            </div>
            <div className='pokemon-card-base-stats'>
                <div className="stat-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>HP</p>
                    <p className="stat-value">{String(Math.round(pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100)))).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100)) / 2} fillColor={`var(--clr-${getTypeName(pokemon.type[0].id)})`} />
                </div>
                <div className="stat-wrap">
                    <p className="stat-name" style={{ borderRight: "1px solid black" }}>DEF</p>
                    <p className="stat-value">{String(Math.round(pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100)))).padStart(3, "0")}</p>
                    <ProgressBar percent={pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100)) / 2} fillColor={`var(--clr-${getTypeName(pokemon.type[0].id)})`} />
                </div>
            </div>
            <div className='pokemon-card-moves'>
                {pokemon.moves.map(move => (
                    <div className='pokemon-card-move' style={{ outline: ``, boxShadow }}> {/**TODO POZADINA ZA POKRET*/}
                        <p className='move-type' style={{ borderBottom: "1px solid black" }}>{move.type.name}</p>
                        <div className='move-info-wrap'>
                            <p className='move-dmg' style={{ borderRight: "1px solid black" }}>DMG:</p><p className='move-dmg-val'>{move.attackBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100))}</p>
                        </div>
                        <div className='move-info-wrap'>
                            <p className='move-mna' style={{ borderRight: "1px solid black" }}>MNA:</p><p className='move-mna-val'>{move.mana}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PokemonCard