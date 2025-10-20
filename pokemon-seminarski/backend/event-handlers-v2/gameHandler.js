//@ts-check
const { Server, Socket } = require("socket.io");
const RoomManager = require("../game-logic/RoomManager");
const Player = require("../game-logic/Player");
const { getUsersPokemonsDB } = require("../db/services/userServices");

/**
 * @typedef {{type: 'attack' | 'switch', attacking: boolean, newPokemonIndex: null | number}} ActionResult
 * @typedef {{player1: Player, player2: Player, actionResult: ActionResult}} GameStateUpdate
 */
/**
 * @param {Server} io 
 * @param {Socket} socket 
 * @param {import("../utils/typedefs").SocketInformation} socketInformation
 * @param {RoomManager} manager
 */
module.exports = (io, socket, socketInformation, manager) => {
    const joinQueue = async ({ pokemons }) => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);
        const inGame = socketInformation.allGameRooms.some(gr => gr.player1?.id === user.id || gr.player2?.id === user.id);
        if (inGame) {
            return socket.emit('game:queue:join:failed', { message: 'Already in queue/game', roomId: inGame.roomId });
        }

        if (!Array.isArray(pokemons)) {
            return socket.emit('game:queue:join:failed', { message: 'Expected array of pokemons' });
        }

        if (pokemons.length !== 3) {
            return socket.emit('game:queue:join:failed', { message: 'Expected 3 pokemons' });
        }

        const usersPokemons = (await getUsersPokemonsDB(user.id)).filter(p => pokemons.some(up => up === p.id));
        if (usersPokemons.length !== 3) {
            return socket.emit('game:queue:join:failed', { message: 'Expected 3 pokemons that you own' });
        }

        const player = new Player(socket, user.id, user.username, usersPokemons)

        const emptyGame = socketInformation.allGameRooms.find(r => r.status === "waiting");
        if (emptyGame == undefined) {
            try {
                manager.createRoom(player);
                return socket.emit('game:queue:join:success', { message: 'Created room and joined queue' });
            } catch (error) {
                console.error(error);
                return socket.emit('game:queue:join:failed', { message: 'Too many games right now, try later' });
            }
        } else { // ROOM IS FOUND
            socket.emit('game:queue:join:success', { message: 'We found you a game, you will be redirected soon' }); // QUEUE ENTERED -> early, otherwise this event will never reach the one waiting for queue
            emptyGame.joinGame(player); // GAME ENTERED -> QUEUE FOUND
        }
    }

    const leaveQueue = () => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);
        const inGame = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);

        if (inGame == null) {
            return socket.emit('game:queue:leave:success', { message: "Can't leave the room when you are in no room" });
        }
        if (inGame.status === 'playing') {
            return socket.emit('game:queue:leave:failed', { message: "Already in a game thats is playing", roomId: inGame.roomId });
        }

        inGame.delete();
        return socket.emit('game:queue:leave:success', { message: 'Succesfully left the queue' });
    }

    /**
     * @param {{roomId: number}} param0 
     */
    const joinGame = ({ roomId }) => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);
        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);
        if (!user) {
            return socket.emit('game:connect:failed', { message: 'No entry for you, please reconnect' });
        }
        console.log("User " + user.username + " requested to join a room.",
            "We found this room candidate that he is in:", game?.roomId);

        if (game == null) {
            return socket.emit('game:connect:failed', { message: 'Not in a game' });
        }

        if (game.roomId !== roomId) {
            return socket.emit('game:connect:redirect', { message: 'Wrong game', roomId: roomId });
        }

        let player;
        let enemy;
        let ourTurn;
        if (game.player1.id === user.id) {
            player = game.player1.sanatize();
            enemy = game.player2.sanatize();
            ourTurn = true;
        } else {
            player = game.player2.sanatize();
            enemy = game.player1.sanatize();
            ourTurn = false;
        }
        return socket.emit('game:connect:success', { player: player, enemy: enemy, ourTurn: ourTurn });
    }

    /**
     * @param {{moveId: number}} param0 
     * @returns 
     */
    const attack = ({ moveId }) => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);

        if (user == null) {
            return socket.emit('game:connect:failed', { message: "No entry for you, please reconnect" });
        }

        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);

        if (game == null || game.status !== 'playing') {
            return socket.emit('game:action:failed', { message: "Can't request action if you are in no game" });
        }

        let player = game.player1.id === user.id ? game.player1 : game.player2;
        if (!player.pokemons[player.selectedPokemonIndex].moves.some(move => move.id === moveId)) {
            return socket.emit('game:action:failed', { message: "Such move is not found on selected pokemon", state: game.generateStateForPlayer(user.id) });
        }

        console.log("moveID provided:", moveId);
        try {
            game.action(user.id, 'attack', moveId);
        } catch (error) {
            // @ts-ignore
            return socket.emit('game:action:failed', { message: `Error: ${error.message}`, state: game.generateStateForPlayer(user.id) });
        }
    }

    /**
     * @param {{pokemonIndex: number}} param0 
     */
    const switchPokemon = async ({ pokemonIndex }) => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);

        if (user == null) {
            return socket.emit('game:connect:failed', { message: "No entry for you, please reconnect" });
        }

        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);

        if (game == null || game.status !== 'playing') {
            return socket.emit('game:action:failed', { message: "Can't request action if you are in no game" });
        }

        let player = game.player1.id === user.id ? game.player1 : game.player2;
        if (!player.pokemons.some(val => val.id === pokemonIndex && val.stats.hp > 0)) {
            return socket.emit('game:action:failed', { message: "Can't find the pokemon to switch to", state: game.generateStateForPlayer(user.id) });
        }

        try {
            game.action(user.id, 'switch', pokemonIndex);
        } catch (error) {
            // @ts-ignore
            return socket.emit('game:action:failed', { message: `Error: ${error.message}`, state: game.generateStateForPlayer(user.id) });
        }
    }

    const skipTurn = () => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);

        if (user == null) {
            return socket.emit('game:connect:failed', { message: "No entry for you, please reconnect" });
        }

        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);

        if (game == null || game.status !== 'playing') {
            return socket.emit('game:action:failed', { message: "Can't leave the game when you are not in a game" });
        }

        try {
            game.action(user.id, 'skip', undefined);
        } catch (error) {
            // @ts-ignore
            return socket.emit('game:action:failed', { message: `Error: ${error.message}`, state: game.generateStateForPlayer(user.id) });
        }
    }

    const leaveGame = () => {
        const user = socketInformation.allConnectedUsers.find(cu => cu.socket.id === socket.id);

        if (user == null) {
            return socket.emit('game:connect:failed', { message: "No entry for you, please reconnect" });
        }

        const game = socketInformation.allGameRooms.find(gr => gr.player1.id === user.id || gr.player2.id === user.id);

        console.log("game that is found: ",
            !game ? null : (String(game.roomId) + game.status)
        )
        if (game == null || game.status !== 'playing') {
            return socket.emit('game:action:leave:failed', { message: "Can't leave the game when you are not in a game" });
        }

        let player = game.player1.id === user.id ? game.player1 : game.player2
        player.leftTheGame = true;

        player.socket.emit('game:action:leave:success');
        game.endGame();
    }


    socket.on("game:connect", joinGame);
    socket.on("game:queue:join", joinQueue);
    socket.on("game:queue:leave", leaveQueue);
    socket.on("game:action:attack", attack);
    socket.on("game:action:switch", switchPokemon);
    socket.on("game:action:skip", skipTurn);
    socket.on("game:action:leave", leaveGame);
}