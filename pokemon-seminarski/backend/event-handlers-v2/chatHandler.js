const { Server, Socket } = require("socket.io");
const { insertMessageDB } = require("../db/services/messagesServices");
const { z } = require("zod");
const { getUserById } = require("../db/services/userServices");

const GLOBAL_CHAT_ROOM = "chat:global";

/**
 * 
 * @param {Server} io 
 * @param {Socket} socket 
 * @param {import("../utils/typedefs").SocketInformation} socketInformation
 */
module.exports = (io, socket, socketInformation) => {
    const messageGlobal = (data) => {
        const user = socketInformation.allConnectedUsers.find((user) => user.socket.id === socket.id);
        if(!user) return;

        const message = {
            id: user.id,
            username: user.username,
            message: data?.message,
        }
        io.to(GLOBAL_CHAT_ROOM).emit('message:global:received', message);
    }

    const messageFriend = async ({ receiver, message }) => {
        if (!z.string().safeParse(message).success || !z.number().int().safeParse(receiver).success) {
            return; // Bad request
        }

        console.log(socketInformation.allConnectedUsers.map(u => {u.username, u.socket.id}));
        console.log("socket id making a request", socket.id);


        const user1 = socketInformation.allConnectedUsers.find((user) => user.socket.id === socket.id);
        const user2 = socketInformation.allConnectedUsers.find((user) => user.id === receiver);
        let verified;
        if (!user1) {
            return console.log('Ovo se ponekad okine al ja stvarno ne znam kako') // Predpostavljam kada se desi nešto kad se povežu sa drugog socketa nmp
        }

        if (user2 === undefined) {
            verified = await getUserById(receiver);
            if (verified == null) {
                return console.log("Can't send message to user that is fucked up and missing");
            }
        }
        const createdAt = (await insertMessageDB({ message: message, receiverUserId: user2?.id ?? verified.id, senderUserId: user1.id })).createdAt;

        const data = {
            sender: {
                id: user1.id,
                username: user1.username
            },
            receiver: {
                id: user2?.id ?? verified.id,
                username: user2?.username ?? verified.username
            },
            message: message,
            createdAt: createdAt
        }


        socket.emit("message:private:received", data);
        if (user2) {
            user2.socket.emit("message:private:received", data);
        }
    }

    // Room joining
    socket.join(GLOBAL_CHAT_ROOM); // Automatic join to global namespace

    // Event registration
    socket.on("chat:message:global", messageGlobal);
    socket.on("chat:message:private", messageFriend);
}