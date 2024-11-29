import React from 'react'
import '../css/Loader.css'
const Loader = (params) => {
    return (
        <div className={`loader ${params.className ? params.className : ""}`} style={params.style} {...params}></div>
    )
}

export default Loader