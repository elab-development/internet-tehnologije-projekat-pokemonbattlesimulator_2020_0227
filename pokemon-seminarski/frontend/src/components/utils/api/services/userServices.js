import API from "../API";
import parseUser from "../parsers/userParser";

const getUsers = async ({ ids, searchQuery }, signal = undefined) => {
    const params = {};
    if (ids != null && Array.isArray(ids)) {
        params.users = ids;
        params.l = 'y'
    }

    if (searchQuery != null && searchQuery != "") {
        params.usernameQuery = searchQuery;
    }

    const response = await API.get('/users', { params: params, signal: signal });
    return response.data.data.map(parseUser);
}

const getUserById = async (id, signal = undefined) => {
    const response = await API.get(`/users/${id}`, { params: params, signal: signal });
    return parseUser(response.data);
}

export { getUsers, getUserById };