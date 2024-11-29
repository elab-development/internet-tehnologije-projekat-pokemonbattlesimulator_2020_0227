import React, { useState } from 'react'
import { useOutlet } from 'react-router-dom'

const AnimationOutlet = () => {
    const o = useOutlet();
    const [outlet] = useState(o);

    return (
        <>{outlet}</>
    )
}

export default AnimationOutlet