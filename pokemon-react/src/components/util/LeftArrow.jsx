import React from 'react';
import { chevronLeft } from '../../images/components';

const LeftArrow = ({ currentId , func}) => {

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
                        onClick={() => func()}
                    />
            }
        </>
    )
}

export default LeftArrow