const { updateUsersStatsDB } = require('../db/services/userServices');
const Player = require('./Player');
const RoomManager = require('./RoomManager');
/**
 * Data wrapper for Rooms, all Room behaviour is managed by `RoomManager` check {@link RoomManager | link}
 */
module.exports = class Room {
    /**
     * @param {RoomManager} observer reference to parent manager
     * @param {number} roomId unique id
     * @param {Player} player1 player one (creator of room)
     * @param {Player} player2 player two (one who joined)
     * @param {'waiting' | 'playing'} status represents the current state of the room
     * @param {boolean} turn true if its player1 turn, else its false
     * @param {{movesEffectivenesses: { attackerTypeId: number; defenderTypeId: number; effectivness: string;}[]}} essentialsRef 
     */
    constructor(observer, roomId, player1, player2, essentialsRef, status = 'waiting') {
        this.observer = observer;
        this.roomId = roomId;
        this.player1 = player1;
        this.player2 = player2;
        this.status = status;
        this.turn = true;
        this.essentialsRef = essentialsRef;
    }

    get broadcastOperator() {
        return this.observer.io.to(this.roomId);
    }

    /** Notifies players that game is found */
    broadcastFoundGame() {
        this.broadcastOperator.emit('game:queue:found', { id: this.roomId });
        this.status = 'playing';
    }

    generateStateForPlayer(id) {
        return {
            player: this.player1.id === id ? this.player1.sanatize() : this.player2.sanatize(),
            enemy: this.player1.id === id ? this.player2.sanatize() : this.player1.sanatize(),
            ourTurn: this.player1.id === id ? this.turn : !this.turn
        }
    }

    /**
     * Performs action of type `'attack' | 'switch' | 'skip'`
     * @param {number} userId User that requests an action
     * @param {'attack' | 'switch' | 'skip'} type  type of attack
     * @param {number} id Either moveId or pokemonIndex, if skip ommited then dont provide anything
     */
    action(userId, type, id) {
        const currentPlayer = this.turn ? this.player1 : this.player2;
        const opponentPlayer = this.turn ? this.player2 : this.player1;

        if (userId !== currentPlayer.id) {
            throw new Error('Not your turn');
        }

        let end;
        if (type === 'attack') {
            end = this.handleAttack(currentPlayer, opponentPlayer, id);
            this.turn = !this.turn;
            currentPlayer.mana += 7;
        } else if (type === 'switch') {
            this.handleSwitch(currentPlayer, id);
        } else if (type === 'skip') {
            this.turn = !this.turn;
            currentPlayer.mana += 7;
        }


        this.player1.socket.emit('game:update', {
            ...this.generateStateForPlayer(),
            actionResult: {
                type: type,
            }
        });
        this.player2.socket.emit('game:update', {
            ...this.generateStateForPlayer(),
            actionResult: {
                type: type,
            }
        });

        if (end != null && end < 0) {
            this.endGame();
        }
    }

    /**
     * @param {Player} currentPlayer 
     * @param {Player} opponentPlayer 
     * @param {number} moveIndex 
     */
    handleAttack(currentPlayer, opponentPlayer, moveIndex) {
        const currentPokemon = currentPlayer.pokemons[currentPlayer.selectedPokemonIndex];
        const opponentPokemon = opponentPlayer.pokemons[opponentPlayer.selectedPokemonIndex];

        const selectedMove = currentPokemon.moves[moveIndex];
        if (currentPlayer.mana < selectedMove.mana) {
            throw new Error('Not nough mana to perform this move');
        }

        currentPlayer.mana -= selectedMove.mana;

        // ATK * (DEF/(MAX_DEF * 2))/2 -> DEF maksimalno može da se smanji napad za 50%
        const effectivness = this.essentialsRef.movesEffectivenesses.find(val =>
            val.attackerTypeId === selectedMove.type.id && opponentPokemon.type.some(t => t.id === val.defenderTypeId)
        )?.effectivness ?? 1;
        const damage = (selectedMove.atk * (1 - opponentPokemon.stats.def / (100 * 2 * 2))) * effectivness;
        opponentPokemon.stats.hp -= damage > 0 ? damage : 0;

        if (opponentPlayer.stats.hp <= 0) {
            opponentPokemon.stats.hp = 0;
            const nextPokemonIndex = opponentPlayer.pokemons.findIndex(val => val.stats.hp > 0);
            opponentPlayer.selectedPokemonIndex = nextPokemonIndex;
        }
        return opponentPlayer.selectedPokemonIndex;
    }

    /**
     * @param {Player} currentPlayer 
     * @param {number} pokemonIndex 
     */
    handleSwitch(currentPlayer, pokemonIndex) {
        currentPlayer.selectedPokemonIndex = pokemonIndex;
    }


    /**@param {Player} player  */
    joinGame(player) {
        player.socket.join(this.roomId);
        preparedPlayer
        if (this.player1 == null) {
            this.player1 = player;
        } else {
            this.player2 = player;
            this.foundGame();
        }
    }

    /**
     * Writes results to database and removes the gamelobby
     */
    async endGame() {
        const checkP1 = this.player1.pokemons.every(val => val.stats.hp <= 0) || this.player1.socket.disconnected || this.player1.leftTheGame;
        const checkP2 = this.player2.pokemons.every(val => val.stats.hp <= 0) || this.player2.socket.disconnected || this.player2.leftTheGame;

        if (checkP1) {
            this.player1.socket.emit('game:end', { message: `player '${this.player1.username}' won, wohoo` });
            this.player2.socket.emit('game:end', { message: `player '${this.player1.username}' won, too bad` });
        } else if (checkP2) {
            this.player2.socket.emit('game:end', { message: `player '${this.player2.username}' won, wohoo` });
            this.player1.socket.emit('game:end', { message: `player '${this.player2.username}' won, too bad` });
        } else {
            return; // THROW NEW ERROR
        }

        updateUsersStatsDB(this.player1.id, {
            won: checkP2,
            numOfDefeatedPokemon: this.player2.pokemons.reduce((acc, val) => val.stats.hp <= 0 ? acc + 1 : acc, 0),
        }).catch((err) => console.error('some mf error' + err.message));
        updateUsersStatsDB(this.player1.id, {
            won: checkP1,
            numOfDefeatedPokemon: this.player1.pokemons.reduce((acc, val) => val.stats.hp <= 0 ? acc + 1 : acc, 0),
        }).catch((err) => console.error('some mf error' + err.message));

        this.delete();
    }

    /**
     * Deletes room from the RoomManager that is observing it
     */
    delete() {
        this.observer.removeRoom(this);
    }
}