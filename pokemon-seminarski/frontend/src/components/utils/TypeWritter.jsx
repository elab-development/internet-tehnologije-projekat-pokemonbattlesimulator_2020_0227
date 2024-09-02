import React, { useEffect } from 'react'

const TypeWritter = ({ text, delayPerLetter = 100, totalDuration = null, initialDelay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let currentIndex = 0;
        let timer;

        const typeText = (initDelay) => {
            if (currentIndex < text.length) {
                setDisplayedText(prev => prev + text[currentIndex]);
                currentIndex++;
                const delay = totalDuration ? totalDuration / text.length : delayPerLetter;
                timer = setTimeout(typeText, delay + initDelay);
            }
        }

        typeText(initialDelay);
        return () => clearTimeout(timer);
    }, [text, delayPerLetter, totalDuration]);

    return (
        <>{displayedText}</>
    )
}

export default TypeWritter