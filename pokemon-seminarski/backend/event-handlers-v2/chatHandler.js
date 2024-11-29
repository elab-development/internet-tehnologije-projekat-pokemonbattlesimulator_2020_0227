const { Server, Socket } = require("socket.io");
const { insertMessageDB } = require("../db/services/messagesServices");
const { z } = require("zod");

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
        const message = {
            id: user.id,
            username: user.username,
            message: data?.message,
        }
        io.to(GLOBAL_CHAT_ROOM).emit('message:global:received', message);
    }

    const messageFriend = async (friend, text) => {
        if (!z.string().safeParse(text).success != null || !z.number().int().safeParse().success) {
            return; // Bad request
        }
        const user1 = socketInformation.allConnectedUsers.find((user) => user.socket.id === socket.id);
        const user2 = socketInformation.allConnectedUsers.find((user) => user.socket.id === friend);
        const createdAt = (await insertMessageDB({ message: text, receiverUser: user2, senderUserId: user1 })).createdAt;

        const data = {
            sender: {
                id: user1.id,
                username: user1.username
            },
            receiver: {
                id: user1.id,
                username: user2.username
            },
            message: text,
            createdAt: createdAt
        }
        socket.emit("message:private:received", data);
        user2.socket.emit("message:private:received", data);
    }

    // Room joining
    socket.join(GLOBAL_CHAT_ROOM); // Automatic join to global namespace

    // Event registration
    socket.on("chat:message:global", messageGlobal);
    socket.on("chat:message:friend", messageFriend);
}