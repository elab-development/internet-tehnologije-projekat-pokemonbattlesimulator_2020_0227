import React, { useState } from 'react'
import ProgressBar from './ProgressBar'
import { getTypeName } from './pokemonTypes'
import { pokeGITAPI } from '../Collection'


function getColor(typeID, transparent = false) {
    return `var(--clr-${getTypeName(typeID)}${transparent ? "-transparent" : ""})`
}

/** 
 * FOR FUTURE REFERENCE!!!!
 * * maximum values for STATS are 200. 100 by base and + additional 100 by expirience
 * * maximum value for XP is 100, after which evolution is enabled
 * @param {{
 *  pokemon: import('../Collection').UsersPokemonExpanded, 
 *  onClick: (pokemon: import('../Collection').UsersPokemonExpanded) => Promise<void>, 
 *  options: {evolvable?: boolean, selectable?: boolean, deselectable?: boolean}, 
 *  isSelected?: boolean
 * }} param0 
 */
const PokemonCard = ({ pokemon, onClick, options = {}, isSelected = false }) => {
    const { evolvable = false, selectable = false, deselectable = false } = options;
    const color = getColor(pokemon.type[0].id)
    const colorTransparent = getColor(pokemon.type[0].id, true);
    const [isClickedBlocked, setIsClickedBlocked] = useState(false);

    const handleClick = () => {
        if ((evolvable && pokemon.canEvolve && !isClickedBlocked)
            || (selectable)
            || (deselectable)
        ) {
            setIsClickedBlocked(true)
            onClick(pokemon).finally(() => {
                setIsClickedBlocked(false);
            });
            return;
        }
    }

    return (
        <div className="pokemon-card" onClick={handleClick} style={{ "--currentColor": color, "--currentTransparentColor": colorTransparent, ...(isClickedBlocked ? { cursor: "not-allowed" } : {}) }}>
            {evolvable && pokemon.canEvolve && (
                <div className="evolve-picture">
                    <svg width="143" height="169" viewBox="0 0 143 169" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M71.42 0.5L142.838 71.9178V83L71.42 40L0.00246429 83L0.00234222 71.9178L71.42 0.5Z" fill="#FFE100" />
                        <path d="M71.4135 57L142.831 100L142.833 126L71.4174 83L-0.00256348 126L-0.00390625 100L71.4135 57Z" fill="#FFE100" />
                        <path d="M71.4159 100L142.834 143L142.835 169L71.4199 126L-0.00012207 169L-0.00146484 143L71.4159 100Z" fill="#FFE100" />
                    </svg>
                </div>
            )}
            {selectable && isSelected ? (
                <div className='selected-overlay'>
                    <div><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50.5 10c-15 14-25 42-25 42C16 40.5 10 38 10 38" stroke="#28a745" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg></div>
                </div>
            ) : (<div className='not-selected-overlay' />)}
            {deselectable && (
                <div className='deselectable-overlay'>
                    <div><svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M48.8789 7.87868c1.1716-1.17157 3.0706-1.17157 4.2422 0 1.1716 1.17157 1.1716 3.07062 0 4.24222L36 29.242s-1 .7872-1 1.758 1 1.7576 1 1.7576l17.1211 17.1211c1.1716 1.1716 1.1716 3.0706 0 4.2422-1.1716 1.1715-3.0706 1.1715-4.2422 0L31.7581 37S30.971 36 30 36c-.9709 0-1.758 1-1.758 1L11.1211 54.1209c-1.17156 1.1715-3.0706 1.1715-4.24218 0-1.17157-1.1716-1.17157-3.0706 0-4.2422L24 32.7576s1-.787 1-1.7578-1-1.7578-1-1.7578L6.87892 12.1209c-1.17157-1.1716-1.17157-3.07065 0-4.24222 1.17158-1.17157 3.07062-1.17157 4.24218 0L28.242 24.9995S29.0291 26 30 26c.971 0 1.7581-1.0005 1.7581-1.0005L48.8789 7.87868Z" fill="#E11848" />
                    </svg></div>
                </div>
            )}
            <div className='pokemon-card-types'>
                {pokemon.type.map(t => <div key={t.id} style={{ background: `var(--pic-${t.name})` }} />)}
            </div>
            <h3 className='pokemon-card-title'>#{String(pokemon.id).padStart(3, "0")} - {pokemon.name}</h3>
            <div className='pokemon-card-picture'>
                <img src={pokeGITAPI(pokemon.id)} alt='pokemon-image' />
            </div>
            <hr style={{ borderColor: color }} />
            <div className='pokemon-card-base-stats'>
                <div className="stat-wrap">
                    <p className="stat-name">HP</p>
                    <div className='stat-group'>
                        <p className="stat-value">
                            <code>{String(Math.round(pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp / 100)))).padStart(3, "0")}</code>
                        </p>
                        <ProgressBar percent={pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp / 100)) / 2} fillColor={color} />
                    </div>
                </div>
                <div className="stat-wrap">
                    <p className="stat-name">DEF</p>
                    <div className='stat-group'>
                        <p className="stat-value">
                            <code>{String(Math.round(pokemon.baseStats.defenseBase * (1 + (pokemon.xp / 100)))).padStart(3, "0")}</code>
                        </p>
                        <ProgressBar percent={pokemon.baseStats.defenseBase * (1 + (pokemon.xp / 100)) / 2} fillColor={color} />
                    </div>
                </div>
                <div className="stat-wrap">
                    <p className="stat-name">XP</p>
                    <div className='stat-group'>
                        <p className="stat-value">
                            <code>{String(Math.min(100, Math.round(pokemon.xp))).padStart(3, "0")}</code>
                        </p>
                        <ProgressBar percent={Math.min(100, Math.round(pokemon.xp))} fillColor={color} />
                    </div>
                </div>
            </div>
            <hr style={{ borderColor: color, marginTop: 5 }} />
            <div className='pokemon-card-moves'>
                {pokemon.moves.map(move => (
                    <div key={move.id} className='pokemon-card-move'>
                        <p className='move-name'><span aria-hidden="true" style={{ background: `var(--pic-${move.type.name})` }} /> {move.name}</p>
                        <div className='move-info-wrap'>
                            <div className='move-info'>
                                <p className='move-dmg-val'>
                                    <code>{String(Math.round(move.attackBase * (1 + pokemon.xp / 100))).padStart(3, "0")}</code>
                                </p>
                                <p className='move-dmg'> DMG</p>
                            </div>
                            <div className='move-info'>
                                <p className='move-mna-val'>
                                    <code>{String(move.mana).padStart(2, "0")}</code>
                                </p>
                                <p className='move-mna'> MNA</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PokemonCard