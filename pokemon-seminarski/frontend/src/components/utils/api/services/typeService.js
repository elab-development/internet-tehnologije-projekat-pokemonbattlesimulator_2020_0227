import API from "../API";

const getAllTypes = async () => {
    return (await API.get('/types')).data.data;
}

export { getAllTypes }