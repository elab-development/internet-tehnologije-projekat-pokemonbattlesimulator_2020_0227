import React, { useContext } from 'react'
import { UserContext } from '../contexts/UserContextProvider'
import { useParams } from 'react-router-dom';
import Career from './Career';
import ForeignCareer from './ForeignCareer';

/**@param {string} str  */
export function splitCamelCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}

const CareerWrapper = () => {
    const { info } = useContext(UserContext);
    const params = useParams();
    return (
        <>
            {params.id === info.id || params.id === info.username ? <Career /> : <ForeignCareer />}
        </>
    )
}

export default CareerWrapper