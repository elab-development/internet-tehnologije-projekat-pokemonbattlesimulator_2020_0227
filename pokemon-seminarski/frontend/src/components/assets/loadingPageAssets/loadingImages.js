const images = {
    0: require('./loading_9.webp'),
    1: require('./loading_1.gif'),
    2: require('./loading_2.webp'),
    3: require('./loading_3.webp'),
    4: require('./loading_4.webp'),
    5: require('./loading_5.webp'),
    6: require('./loading_6.webp'),
    7: require('./loading_8.webp'),
}

const getRandomImage = () => images[Math.floor(Math.random() * 8)];

export { images, getRandomImage };