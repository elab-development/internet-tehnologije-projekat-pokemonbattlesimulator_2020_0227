import axios from "axios";
import { MAX_POKEMON } from "./constants";

class Pokemon {
    constructor(baseInfo, speciesInfo) {
        this.id = baseInfo.data.id;
        this.name = baseInfo.data.name;
        this.types = baseInfo.data.types;
        this.weight = baseInfo.data.weight;
        this.height = baseInfo.data.height;
        this.abilities = baseInfo.data.abilities;
        this.stats = baseInfo.data.stats;
        this.description = Pokemon.getEnglishTextFromRequest(speciesInfo.data);
    }


    static getEnglishTextFromRequest(pokemonSpecies) {
        if (pokemonSpecies === undefined)
            return "";
        else
            for (const entry of pokemonSpecies.flavor_text_entries) {
                if (entry.language.name === "en") {
                    const flavor = entry.flavor_text.replace(/\f/g, " ");
                    return flavor;
                }
            }
        return "";
    }

    getMainTypeColor() {
        return this.types[0].type.name;
    }

    static async loadPokemon(id, setPokemon, navigate, cancelToken = undefined) {
        if (id < 1 || id > MAX_POKEMON) {
            navigate();
        }
        try {
            const baseInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`, { cancelToken: cancelToken?.token });
            const speciesInfo = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`, { cancelToken: cancelToken?.token });
            const pokemon = new Pokemon(baseInfo, speciesInfo)
            setPokemon(pokemon);
        } catch (error) {
            console.log(error);
        }
    }
}

export default Pokemon;