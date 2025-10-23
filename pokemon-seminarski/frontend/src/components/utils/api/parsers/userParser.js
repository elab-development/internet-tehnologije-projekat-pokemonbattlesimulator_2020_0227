const parseUser = (data) => {
    return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : null
    };
}

const parseUserToFriend = (data) => {
    return {
        ...data,
        fetched: false,
        newMessage: false,
        messages: []
    }
}
export default parseUser;
export { parseUserToFriend }