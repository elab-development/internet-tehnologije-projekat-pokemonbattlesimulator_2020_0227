import React from 'react'

const ProgressBar = ({ percent = "0", fillColor, backgroundColor,width = "100%", height = "10px", ...params }) => {

    const transparentBar = () => {
        return fillColor.slice(0,-1) + "-transparent)";
    }

    return (
        <div className="progress-bar" style={{
            width: width,
            height: height,
            backgroundColor: backgroundColor ? backgroundColor : transparentBar(),
            borderRadius: "10px",
            overflow: "hidden",
        }}>
            <div className="progress-fill" style={{
                height: "100%",
                width: `${percent}%`,
                backgroundColor: fillColor,
            }} />
        </div>
    )
}

export default ProgressBar