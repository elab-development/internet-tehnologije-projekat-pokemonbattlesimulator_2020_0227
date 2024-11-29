export const MAX_POKEMON = 500;
export const PER_PAGE = 50;
export const BASE_API_URL = "https://pokeapi.co/api/v2";
export const VARIANTS = {
    hidden: {
        opacity: 0
    },
    visiblePokemon: {
        opacity: 1,
        transition: { duration: 1 }
    },
    visibleLoading: {
        opacity: 1,
        transition: { duration: 1 }
    },
    exit: {
        opacity: 0,
    }
}