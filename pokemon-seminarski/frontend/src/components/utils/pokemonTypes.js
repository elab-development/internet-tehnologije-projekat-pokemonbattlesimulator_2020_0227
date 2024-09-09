const typesColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
}

const typesNames = {
    1: "normal",
    2: "fighting",
    3: "flying",
    4: "poison",
    5: "ground",
    6: "rock",
    7: "bug",
    8: "ghost",
    9: "steel",
    10: "fire",
    11: "water",
    12: "grass",
    13: "electric",
    14: "psychic",
    15: "ice",
    16: "dragon",
    17: "dark",
    18: "fairy",
}

const getTypeColor = (q) => typeof q === 'number' ? typesColors[typesNames[q]] : typesColors[q];
const getTypeTransparentColor = (q) => (typeof q === 'number' ? typesColors[typesNames[q]] : typesColors[q]) + "80";
const getTypeName = (q) => typesNames[q];


export {
    getTypeColor,
    getTypeTransparentColor,
    getTypeName
};

