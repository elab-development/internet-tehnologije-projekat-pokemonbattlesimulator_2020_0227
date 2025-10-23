import React, { useEffect, useState } from 'react'

const TypeWritter = ({ text, delayPerLetter = 200, totalDuration = null } = {}) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
    }, [text])

    useEffect(() => {
        let timeouts = [];
        for (let index = 0; index < text.length; index++) {
            const letter = text[index];
            timeouts.push(setTimeout(() => setDisplayedText(prev => prev + letter), index * delayPerLetter));
        }

        return () => {
            for (const timeout of timeouts) {
                clearTimeout(timeout);
            }
        };
    }, [text, delayPerLetter, totalDuration]);

    return (
        <>{displayedText}</>
    )
}

export default TypeWritter