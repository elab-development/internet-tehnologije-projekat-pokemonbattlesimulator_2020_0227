import React from 'react'
import { useNavigate } from 'react-router-dom';
import { chevronRight } from '../../images/components';
import { MAX_POKEMON } from './constants';

const RightArrow = ({ currentId }) => {
    const navigate = useNavigate();

    const handleHidden = () => {
        if (parseInt(currentId) === MAX_POKEMON - 1) {
            return true;
        }
        return false;
    }

    return (
        <img
            src={chevronRight}
            alt="right-arrow"
            className='right-arrow'
            hidden={handleHidden()}
            onClick={() => navigate(`/pokemons/${parseInt(currentId) + 1}`)}
        />
    )
}

export default RightArrow