const parseMessage = (data) => {
    return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : null
    };
}

export default parseMessage