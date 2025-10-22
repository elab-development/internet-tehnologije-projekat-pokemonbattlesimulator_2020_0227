import API from "../API";

const getAllMoves = async () => {
    return (await API.get('/moves')).data.data;
}

const createMove = async ({ id, mana, name, attack, type }) => {
    return await API.post('/moves', {
        id,
        attackBase: attack,
        manaCost: mana,
        name: name,
        typeId: type
    });
}

export { getAllMoves, createMove }