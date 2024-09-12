const { Socket } = require("socket.io");

/**
 * @typedef {{id: number, name: string, mana: number, atk: number}} MovesExpanded
 * @typedef {{id: number, name: string, stats: {hp: number, def: number}, moves: MovesExpanded[]}} PokemonExpanded
 * @typedef {{id: number, name: string, mana: number, selectedPokemonIndex: number, pokemons: PokemonExpanded[]}} SanitizedUser strips away socket object
 */
/**
 * Manages players in-game as well as writting to database room stats, this operation is called by Room
 */
module.exports = class Player {
    /**
     * @param {Socket} socket 
     * @param {number} id
     * @param {string} username
     * @param {import("../db/services/userServices").UsersPokemon[]} pokemons 
     */
    constructor(socket, id, username, pokemons) {
        this.socket = socket;
        this.id = id;
        this.username = username;
        this.pokemons = this.calcucaltePokemons(pokemons);
        this.mana = 5;
        this.selectedPokemonIndex = 0;
        this.leftTheGame = false;
    }

    /**@returns {SanitizedUser} */
    sanatize() {
        let { socket, leftTheGame, ...data } = this;
        return { ...data }
    }

    /**
     * @private 
     * @param {import("../db/services/userServices").UsersPokemon[]} pokemons 
     * @returns {PokemonExpanded[]}
     */
    calcucaltePokemons(pokemons) {
        for (const pokemon of pokemons) {
            pokemon.stats = {
                def: pokemon.baseStats.defenseBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100)),
                hp: pokemon.baseStats.healthPointsBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100))
            }
            delete pokemon.baseStats;
            for (const move of pokemon.moves) {
                move.atk = move.attackBase * (1 + (pokemon.xp === 0 ? 0 : pokemon.xp / 100));
                delete move.attackBase;
            }
        }
        return pokemons;
    }

    writeResultsToDatabase() {
        // ...
    }
}