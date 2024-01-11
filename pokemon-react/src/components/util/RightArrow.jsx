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
        <>
            {
                handleHidden() ? undefined :
                    <img
                        src={chevronRight}
                        alt="right-arrow"
                        className='right-arrow'
                        onClick={() => navigate(`/pokemons/${parseInt(currentId) + 1}`)}
                        style={{
                            display: handleHidden() ? "none" : "default",
                            WebkitFilter: "brightness(0) grayscale(1) invert(1)",
                            filter: "brightness(0) grayscale(1) invert(1)",
                            width: "28px"
                        }}
                    />
            }
        </>
    )
}

export default RightArrow