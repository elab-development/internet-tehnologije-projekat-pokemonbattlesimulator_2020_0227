import React, { useEffect } from 'react'
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

    /*useEffect(()=>{
        console.log(currentId)
    }, [currentId]);*/

    return (
        <>
            {
                handleHidden() ? undefined :
                    <img
                        src={chevronLeft}
                        alt="left-arrow"
                        className='left-arrow'
                        style={{
                            WebkitFilter: "brightness(0) grayscale(1) invert(1)",
                            filter: "brightness(0) grayscale(1) invert(1)",
                            width: "28px"
                        }}
                        onClick={() => navigate(`/pokemons/${parseInt(currentId) - 1}`)}
                    />
            }
        </>
    )
}

export default LeftArrow