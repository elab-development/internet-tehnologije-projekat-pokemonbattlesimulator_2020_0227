import React, { useCallback, useState } from 'react'
import { z } from 'zod'
import TypeWritter from '../utils/TypeWritter'
import InputField from '../utils/InputField'
import Collection from '../Collection'
import { addPokemon } from '../utils/api/services/userServices'
import '../css/Admin/GivePokemon.scss'


const inputMap = {
    "user": "user",
    "pokemon": "pokemon"
}

const validationSchema = z.object({
    userId: z.union([z.number().int(), z.string()]),
    pokemonId: z.coerce.number().int(),
})

const GivePokemon = () => {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loadingResponse, setLoadingResponse] = useState(false);
    const [{ pokemon, user }, setInputs] = useState({
        user: "",
        pokemon: ""
    });

    const handleChange = useCallback((event) => {
        const id = event.currentTarget.id;
        setInputs(prev => ({
            ...prev,
            [`${inputMap[id]}`]: event.target.value
        }))
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoadingResponse(true);
        setError("");

        let res;
        if (Number(user)) {
            res = validationSchema.safeParse({
                userId: Number(user),
                pokemonId: pokemon
            })
        } else {
            res = validationSchema.safeParse({
                userId: user,
                pokemonId: pokemon
            })
        }

        if (!res.success) {
            setLoadingResponse(false);
            return setError(res.error.issues[0].message);
        }

        console.log("submited", res)
        addPokemon(res.data)
            .then(() => {
                setSuccess("Successfully created a pokemon");
            })
            .catch((err) => {
                console.error(err)
                setError(err?.message ?? "Error")
            }).finally(() => {
                setLoadingResponse(false);
            })
    }

    return (
        <div className='give-pokemon'>
            <form onSubmit={handleSubmit}>
                <div className='input-item'>
                    <label htmlFor="pokemon"><TypeWritter text="Pokemon ID" totalDuration={500} /></label>
                    <InputField id='pokemon' type='text' value={pokemon} onChange={handleChange} />
                </div>
                <div className='input-item'>
                    <label htmlFor="user"><TypeWritter text="User ID/Name" totalDuration={500} /></label>
                    <InputField id='user' type='text' value={user} onChange={handleChange} />
                </div>
                <button className='button-full' type='submit' disabled={loadingResponse || !(user && pokemon)}>
                    Add pokemon!!
                </button>
                <div className='form-result'>
                    <span className='error-message'>{error}</span><span className='success-message'>{success}</span>
                </div>
            </form>
            <div className='double-wrapper-holy-moly'>
                <h4>All Pokemons</h4>
                <div className='collection-wrapper'>
                    <Collection loadAllPokemons />
                </div>
            </div>
        </div>
    )
}

export default GivePokemon