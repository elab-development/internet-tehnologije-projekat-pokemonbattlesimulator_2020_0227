import React from 'react'
import './css/PokemonCard.css'
import { useNavigate } from 'react-router-dom'

const PokemonCard = ({ pokemon }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/pokemons/${pokemon.id}`);
    }
    return (
        <div className='poke-card' onClick={handleClick}>
            <div className='number-wrap'>
                {`#${String(parseInt(pokemon.id)).padStart(3, "0")}`}
            </div>
            <div className='image-wrap'>
                <img src={`https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemon.id}.svg`} alt="" />
            </div>
            <div className='name-wrap'>
                <p>{`${pokemon.name}`}</p>
            </div>
        </div>
    )
}

export default PokemonCard