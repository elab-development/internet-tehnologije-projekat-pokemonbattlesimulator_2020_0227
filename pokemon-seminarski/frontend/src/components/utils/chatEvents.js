
/**
 * 
 * @param {number} ourId - ID of the current user
 * @param {{sender: {id: number, username: string}, receiver: {id: number, username: string}, message: string, createdAt: Date}[]} messages - Array of messages
 * @param {import("react").Dispatch<import('react').SetStateAction<FriendUser[]>>} setUsersCallback - Callback to update the state of users
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
                existingUser.messages = options.fetched === true ? [msg, ...existingUser.messages] : [...existingUser.messages, msg];
            } else {
                // If the user doesn't exist, create a new entry in the map
                usersMap.set(user.id, {
                    id: user.id,
                    username: user.username,
                    newMessage: false,
                    messages: [msg],
                    newMessage: false,
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


function sendPrivateMessageTo(receiverId, message) {
    socket.emit('chat:message:private', { receiver: userId, message: message });
}

function sendGlobalMessage(message) {
    socket.emit('chat:message:global', { message: message });
}


export {
    addPrivateMessages,
    sendPrivateMessageTo,
    sendGlobalMessage
}