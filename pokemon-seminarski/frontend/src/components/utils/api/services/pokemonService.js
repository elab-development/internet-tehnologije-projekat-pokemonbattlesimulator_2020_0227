import axios from "axios";
import API from "../API"

const pokeAPI = "https://pokeapi.co/api/v2";


async function createPokemon({ id, hp, def, evoID, moves, types }) {
    return await API.post('/pokemons', {
        id,
        defenseBase: def,
        healthPointsBase: hp,
        evolvesTo: evoID,
        moves,
        types,
    });
}


/**@param {(import("../../../Collection").UsersPokemonBackend & import("../../../Collection").UsersPokemonExpansion)[]} pokemons*/
const evolutionToBoolean = (pokemons) => {
    for (const pokemon of pokemons) { // Removes evolves to id and adds a canEvolve property
        pokemon.canEvolve = pokemon.evolvesToPokemonId != null && pokemon.xp >= 100 && !pokemons.some(p => p.id === pokemon.evolvesToPokemonId);
        delete pokemon.evolvesToPokemonId;
    }
}

/**
 * 
 * @param {number} id 
 * @param {boolean} [withDescription] 
 * @returns {Promise<{name: string, picture: string, flavorText?: string}>}
 */
const loadApiData = async (id, withDescription = true) => {
    const pPokemonResponse = await axios.get(`${pokeAPI}/pokemon/${id}`);
    const pPokemon = pPokemonResponse.data;
    let pPokemonSpecies = null;

    const res = {
        name: pPokemon.name,
        picture: pPokemon.sprites.other.dream_world.front_default,
    }

    if (withDescription) {
        const pPokemonSpeciesResponse = await axios.get(`${pPokemon.species.url}`);
        pPokemonSpecies = pPokemonSpeciesResponse.data;
        res.flavorText = pPokemonSpecies.flavor_text_entries?.[0]?.flavor_text || 'No description available';
    }

    return res;
}

/**
 * @returns {import("../../../Collection").UsersPokemonExpanded[]}
 */
const loadUserPokemons = async (userId) => {
    try {
        /**@type {UsersPokemonBackend[]} */
        const pokemonsDB = (await API.get(`/users/${userId}/pokemons`)).data; // MY API

        if (pokemonsDB.length === 0) {
            return [];
        }

        const fetchPromises = pokemonsDB.map(async (element) => {
            const pokemon = (await loadApiData(element.id));
            return {
                ...element,
                ...pokemon,
            };
        });

        const result = await Promise.all(fetchPromises);
        evolutionToBoolean(result);

        return result;
    } catch (error) {
        console.error(error.toJSON?.() || error.message);
        return null;
    }
}

const getAllPokemons = async () => {
    try {
        const res = (await API.get('/pokemons?limit=1000'));
        console.log(res);
        const pokemonsDB = res.data.data
        if (pokemonsDB.length === 0) return [];

        const fetchPromises = pokemonsDB.map(async (element) => {
            const pokemon = (await loadApiData(element.id));
            return {
                ...element,
                ...pokemon,
            };
        });

        const result = await Promise.all(fetchPromises);
        evolutionToBoolean(result);
        return result;
    } catch (error) {
        console.error(error.toJSON?.() || error.message);
        return null;
    }

}


export { createPokemon, loadUserPokemons, loadApiData, getAllPokemons }