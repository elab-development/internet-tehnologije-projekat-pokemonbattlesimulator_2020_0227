import React from 'react'
import { useNavigate } from 'react-router-dom'
import { chevronLeft } from '../../images/components';

const LeftArrow = ({ currentId }) => {
    const navigate = useNavigate();

    const handleHidden = () => {
        if (parseInt(currentId) === 1) {
            return true;
        }
        return false;
    }

    return (
        <img
            src={chevronLeft}
            alt="left-arrow"
            className='left-arrow'
            style={{
                display: handleHidden() ? "none" : "default"
            }}
            onClick={() => navigate(`/pokemons/${parseInt(currentId) - 1}`)}
        />
    )
}

export default LeftArrow