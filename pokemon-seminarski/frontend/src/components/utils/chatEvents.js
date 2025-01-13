import { socket } from "../sockets/sockets";

/**
 * 
 * @param {number} ourId - ID of the current user
 * @param {{sender: {id: number, username: string}, receiver: {id: number, username: string}, message: string, createdAt: Date}[]} messages - Array of messages
 * @param {import("react").Dispatch<import('react').SetStateAction<import("../typedefs/chatTypeDefs").FriendUser[]>>} setUsersCallback - Callback to update the state of users
 * @param {{newMessage: boolean, fetched: boolean, userId: number[]}} options
 */
function addPrivateMessages(ourId, messages, setUsersCallback, options = { newMessage: undefined, fetched: undefined, userId: undefined }) {
    setUsersCallback(prevUsers => {
        if (!Array.isArray(messages)) {
            messages = [messages];
        }

        /**@type {Map<number, import("../ChatV2").FriendUser>} */
        const usersMap = new Map(prevUsers.map(user => [user.id, { ...user }]));

        messages.forEach(msg => {
            const user = msg.sender.id === ourId ? msg.receiver : msg.sender;
            const existingUser = usersMap.get(user.id);

            if (existingUser) {
                // If the user already exists, add the message to their messages array
                // If its fetched it means its the newMessage so you put it on begining, 
                // if not, its the fetched messages so we assume they are older then recived so you put them at the end
                if (options.newMessage != null && options.newMessage) {
                    existingUser.messages = [msg, ...existingUser.messages];
                } else if (options.fetched != null && options.fetched) {
                    existingUser.messages = [...existingUser.messages, msg];
                } else {
                    console.log("What the fuck was this message");
                }
            } else {
                // If the user doesn't exist, create a new entry in the map
                usersMap.set(user.id, {
                    id: user.id,
                    username: user.username,
                    newMessage: false,
                    messages: [msg],
                    fetched: false,
                });
            }
        });

        if (options.fetched != null) {
            usersMap.forEach((user) => {
                if (options.userId?.some((id) => user.id === id)) {
                    user.fetched = options.fetched;
                }
            });
        }
        if (options.newMessage != null) {
            usersMap.forEach((user) => {
                if (options.userId?.some((id) => user.id === id)) {
                    user.newMessage = options.newMessage;
                }
            });
        }

        return Array.from(usersMap.values());
    });
}

/**
 * 
 * @param {number} ourId - ID of the current user
 * @param {{sender: {id: number, username: string}, receiver: {id: number, username: string}, message: string, createdAt: Date}} message - Array of messages
 * @param {import("react").Dispatch<import('react').SetStateAction<import("../typedefs/chatTypeDefs").FriendUser[]>>} setUsersCallback - Callback to update the state of users
 * @returns 
 */
const addNewPrivateMessage = (ourId, message, setUsersCallback) => setUsersCallback((prev) => {
    const opositeUser = message.sender.id === ourId ? message.receiver : message.sender;
    let user = prev.find((friend) => friend.id === opositeUser.id);

    if (user == null) {
        console.log('creating a user!');
        user = {
            id: opositeUser.id,
            username: opositeUser.username,
            newMessage: false,
            messages: [],
            fetched: false,
        }
    } else {
        user = structuredClone(user);
    }

    user.messages = [message, ...user.messages];
    user.newMessage = true;
    return [user, ...prev.filter(val => val.id !== user.id)];
});

/**
 * 
 * @param {number} ourId - ID of the current user
 * @param {{sender: {id: number, username: string}, receiver: {id: number, username: string}, message: string, createdAt: Date}[]} messages - Array of messages
 * @param {import("react").Dispatch<import('react').SetStateAction<import("../typedefs/chatTypeDefs").FriendUser[]>>} setUsersCallback - Callback to update the state of users
 * @returns 
 */
const addFetchedMessages = (userData, messages, setUsersCallback) => setUsersCallback((prev) => {
    if (messages == null) {
        return prev;
    }
    if (typeof userData !== 'object' || Array.isArray(userData) || userData == null) {
        return prev;
    }
    let friends = [...prev];
    let user = friends.find((friend) => friend.id === userData.id);
    if (user == null) { // PREVIOUS IMPLEMENTATION WHO KNOWS WHATS WRONG
        user = {
            ...userData,
            newMessage: false,
            messages: [...messages],
            fetched: false,
        }
    } else if (user.messages.length > 0) {
        const lastNewMessage = user.messages[user.messages.length - 1].createdAt ?? new Date();
        let index = messages.length - 1;
        for (let i = 0; i < messages.length; i++) {
            if (lastNewMessage > messages[i].createdAt) {
                index = i; console.log(i); break;
            }
        }
        user.messages = [...user.messages, ...messages.slice(index)]; // May break here but will produce more accurate solution
    } else {
        user.messages = [...messages];
    }

    /*if (user == null) { // Retarded solution
        user = {
            ...userData,
            newMessage: false,
            fetched: false,
        }
    }*/

    user.messages = [...messages];

    user.fetched = true;
    return [user, ...friends.filter(val => val.id != user.id)];
});


function sendPrivateMessageTo(receiverId, message) {
    socket.emit('chat:message:private', { receiver: receiverId, message: message });
}

function sendGlobalMessage(message) {
    socket.emit('chat:message:global', { message: message });
}


export {
    addPrivateMessages,
    addFetchedMessages,
    addNewPrivateMessage,
    sendPrivateMessageTo,
    sendGlobalMessage
}