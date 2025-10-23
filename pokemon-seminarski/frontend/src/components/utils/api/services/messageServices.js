import API from "../API";
import parseMessage from "../parsers/messageParser"

const getMessages = async ({ user1, user2, direction = "both" }, signal = undefined) => {
    const response = await API.get('/messages', {
        params: {
            user1: user1, user2: user2, direction: direction
        },
        signal: signal
    });
    return response.data.data.map(parseMessage);
}

export { getMessages };