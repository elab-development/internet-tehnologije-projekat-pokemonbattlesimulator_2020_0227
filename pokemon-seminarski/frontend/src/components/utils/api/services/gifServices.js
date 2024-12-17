import API from "../API"

const getGifs = async ({ searchQuery = "" }, signal = undefined) => {
    const response = await API.get('/gifs/search', { params: { q: searchQuery }, signal });
    return response.data.data;
}

export { getGifs }