//@ts-check
const { updateUsersStatsDB, updateUsersPokemonsDB } = require('../db/services/userServices');
const Player = require('./Player');
/**
 * Data wrapper for Rooms, all Room behaviour is managed by `RoomManager` check {@link import('./RoomManager').RoomManager | link}
 */
module.exports = class Room {
    /**
     * @param {import('./RoomManager')} observer reference to parent manager
     * @param {number} roomId unique id
     * @param {Player} player1 player one (creator of room)
     * @param {Player} player2 player two (one who joined)
     * @param {'waiting' | 'playing'} status represents the current state of the room
     * @param {{movesEffectivenesses: { attackerTypeId: number; defenderTypeId: number; effectivness: number;}[]}} essentialsRef 
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

    /**
     * @param {number} userId 
     * @returns 
     */
    generateStateForPlayer(userId) {
        return {
            player: this.player1.id === userId ? this.player1.sanatize() : this.player2.sanatize(),
            enemy: this.player1.id === userId ? this.player2.sanatize() : this.player1.sanatize(),
            ourTurn: this.player1.id === userId ? this.turn : !this.turn
        }
    }

    /**
     * Performs action of type `'attack' | 'switch' | 'skip'`
     * @param {number} userId User that requests an action
     * @param {'attack' | 'switch' | 'skip'} type  type of attack
     * @param {number} [id] Either moveId or pokemonIndex, if skip ommited then dont provide anything
     */
    action(userId, type, id = -1) {
        const currentPlayer = this.turn ? this.player1 : this.player2;  // PLAYER WHOS TURN IT IS
        const opponentPlayer = this.turn ? this.player2 : this.player1; // RECEIVING PLAYER

        if (userId !== currentPlayer.id) {
            throw new Error('Not your turn');
        }

        /**@type {number | undefined} */
        let end;
        if (type === 'attack') {
            end = this.handleAttack(currentPlayer, opponentPlayer, id); // RETURNS -1 if no pokemon has hp
            this.turn = !this.turn;
            currentPlayer.mana += 7;
        } else if (type === 'switch') {
            this.handleSwitch(currentPlayer, id);
        } else if (type === 'skip') {
            this.turn = !this.turn;
            currentPlayer.mana += 7;
        }

        this.player1.socket.emit('game:update', {
            state: this.generateStateForPlayer(this.player1.id),
            actionResult: {
                type: type,
            }
        });
        this.player2.socket.emit('game:update', {
            state: this.generateStateForPlayer(this.player2.id),
            actionResult: {
                type: type,
            }
        });

        if (end != null && end < 0) {
            // Wait for callstack to finish, then call the function, to give time to users to update components
            setTimeout(() => this.endGame(), 1);
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

        const selectedMove = currentPokemon.moves.find(m => m.id === moveIndex);
        if (!selectedMove) {
            throw new Error("Selected Move doesn't exist");
        }
        if (currentPlayer.mana < selectedMove.mana) {
            throw new Error('Not nough mana to perform this move');
        }

        currentPlayer.mana -= selectedMove.mana;

        // ATK * (DEF/(MAX_DEF * 2))/2 -> DEF maksimalno može da se smanji napad za 50%
        const effectivness = this.essentialsRef.movesEffectivenesses.find(val =>
            (val.attackerTypeId === selectedMove.type.id) && opponentPokemon.type.some(t => t.id === val.defenderTypeId)
        )?.effectivness ?? 1;
        const damage = (selectedMove.atk * (1 - opponentPokemon.stats.def / (100 * 2 * 2))) * effectivness;
        opponentPokemon.stats.hp -= damage > 0 ? damage : 0;

        if (opponentPokemon.stats.hp <= 0) {
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
        const newIndex = currentPlayer.pokemons.findIndex(p => p.id === pokemonIndex);
        if (newIndex < -1) {
            throw new Error("You don't have this pokemon");
        }
        currentPlayer.selectedPokemonIndex = newIndex;
    }


    /**@param {Player} player  */
    joinGame(player) {
        player.socket.join(this.roomId);
        //preparedPlayer wtf je ovo
        if (this.player1 == null) {
            this.player1 = player;
        } else {
            this.player2 = player;
            this.broadcastFoundGame();
        }
    }

    /**
     * Writes results to database and removes the gamelobby
     */
    async endGame() {
        const p1Lost = this.player1.pokemons.every(val => val.stats.hp <= 0) || this.player1.socket.disconnected || this.player1.leftTheGame;
        const p2Lost = this.player2.pokemons.every(val => val.stats.hp <= 0) || this.player2.socket.disconnected || this.player2.leftTheGame;

        console.log(p1Lost, p2Lost)
        if (p1Lost) {
            this.player2.socket.emit('game:end', { message: `player '${this.player2.username}' won, wohoo` });
            this.player1.socket.emit('game:end', { message: `player '${this.player2.username}' won, too bad` });
        } else if (p2Lost) {
            this.player2.socket.emit('game:end', { message: `player '${this.player1.username}' won, wohoo` });
            this.player1.socket.emit('game:end', { message: `player '${this.player1.username}' won, too bad` });
        } else {
            console.error("Didn't find any winning condition for any of those two... canceling the endGame");
            return; // THROW NEW ERROR
        }

        updateUsersStatsDB(this.player1.id, {
            won: !p1Lost,
            numOfDefeatedPokemon: this.player2.pokemons.reduce((acc, val) => val.stats.hp <= 0 ? acc + 1 : acc, 0),
        }).then(async () => {
            let coef = 1
            if (this.player1.leftTheGame) return;               // NO XP REWARD FOR FLEEING
            if (this.player2.socket.disconnected) coef = 0.5    // ALL GOOD BUT COEF IS 0.5

            // Calculate the new coef after the penalties
            if (p2Lost) coef = coef * 1.4;                      // WE WON  1.4 coef
            else coef = coef * 0.8;                             // WE LOST 0.8 coef (0.4 coef if we disconnected by mistake)

            // XP is calculated such that, if pokemon is dead then .8 of total xp is awarded, else its 1.1
            const usersPokemonsPromises = this.player1.pokemons.map(async (val) => {
                await updateUsersPokemonsDB(
                    this.player1.id,
                    val.id,
                    val.xp + ((coef * val.stats.hp <= 0 ? 0.8 : 1.1) * Math.floor(Math.random() * (30 - 15 + 1)) + 15)
                )
            });
            await Promise.all(usersPokemonsPromises);
            console.log('updated userspokemons');
        }).catch((err) => console.error('some mf error' + err.message));

        updateUsersStatsDB(this.player2.id, {
            won: !p2Lost,
            numOfDefeatedPokemon: this.player2.pokemons.reduce((acc, val) => val.stats.hp <= 0 ? acc + 1 : acc, 0),
        }).then(async () => {
            let coef = 1;
            if (this.player2.leftTheGame) return;
            if (this.player1.socket.disconnected) coef = 0.5;

            if (p1Lost) coef = coef * 1.4;
            else coef = coef * 0.8;

            const usersPokemonsPromises = this.player2.pokemons.map(async (val) => {
                await updateUsersPokemonsDB(
                    this.player2.id,
                    val.id,
                    val.xp + ((coef * val.stats.hp <= 0 ? 0.8 : 1.1) * Math.floor(Math.random() * (30 - 15 + 1)) + 15)
                )
            });
            await Promise.all(usersPokemonsPromises);
            console.log('updated userspokemons');
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