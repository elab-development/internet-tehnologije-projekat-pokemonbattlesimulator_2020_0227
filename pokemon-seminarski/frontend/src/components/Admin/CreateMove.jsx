import React, { useCallback, useEffect, useState } from 'react'
import { z } from 'zod'
import { createMove } from '../utils/api/services/moveService'
import InputField from '../utils/InputField'
import { getAllTypes } from '../utils/api/services/typeService'
import '../css/Admin/CreateMove.scss'

/**@typedef {import('../typedefs/pokemonTypeDefs').Move} Move*/
/**@typedef {import('../typedefs/pokemonTypeDefs').Type} Type*/

const inputMap = {
    "move-id": "id",
    "name": "name",
    "mana": "mana",
    "attack": "attack"
}

const validationSchema = z.object({
    id: z.coerce.number().int(),
    name: z.coerce.string().min(3),
    mana: z.coerce.number().int().min(1).max(10),
    attack: z.coerce.number().int().min(0).max(100),
    type: z.number().int()
})

const CreateMove = () => {
    /**@type {[moves: Type[], React.Dispatch<React.SetStateAction<Type[]>>]} */
    const [types, setTypes] = useState([]);
    /**@type {[moves: number[], React.Dispatch<React.SetStateAction<number[]>>]} */
    const [selectedTypes, setSelectedTypes] = useState([]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [loadingResponse, setLoadingResponse] = useState(false);

    const [{ attack, id, mana, name }, setInputs] = useState({
        id: "",
        name: "",
        mana: "",
        attack: "",
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
        console.log("submitiing move");
        setLoadingResponse(true);
        setError("");

        const move = validationSchema.safeParse({ attack, id, mana, name, type: selectedTypes[0] })
        if (!move.success) {
            setLoadingResponse(false);
            return setError(move.error.issues[0].message);
        }

        createMove(move.data)
            .then(() => {
                setSuccess("Successfully created a move");
            })
            .catch((err) => {
                console.error(err)
                setError(err?.message ?? "Error")
            }).finally(() => {
                setLoadingResponse(false);
            })
    }

    const selectType = (id) => {
        const type = selectedTypes.findIndex(st => st === id)
        if (type > -1) {
            selectedTypes.splice(type, 1);
            setSelectedTypes([...selectedTypes])
        } else if (selectedTypes.length < 1) {
            selectedTypes.push(id);
            setSelectedTypes([...selectedTypes])
        }
    }

    useEffect(() => {
        getAllTypes().then((result) => {
            setTypes(result);
        }).catch((err) => console.error("Coudln't load types", err));
    }, [])

    return (
        <div className='create-move'>
            <div className='form-wrapper'>
                <form onSubmit={handleSubmit}>
                    <div className='fields-wrapper'>
                        <div className='fields'>
                            <div className='input-item'>
                                <label htmlFor="move-id">Move ID</label>
                                <InputField id='move-id' type='text' value={id} onChange={handleChange} />
                            </div>
                            <div className='input-item'>
                                <label htmlFor="name">Move Name</label>
                                <InputField id='name' type='text' value={name} onChange={handleChange} />
                            </div>
                            <div className='input-item'>
                                <label htmlFor="mana">Mana Cost</label>
                                <InputField id='mana' type='text' value={mana} onChange={handleChange} />
                            </div>
                            <div className='input-item'>
                                <label htmlFor="attack">Damage caused by the move</label>
                                <InputField id='attack' type='text' value={attack} onChange={handleChange} />
                            </div>
                        </div>
                        <div className='submit-wrapper'>
                            <button type='submit' className='button-full' disabled={loadingResponse || !(id && name && mana && attack && selectedTypes.length > 0)}>
                                Create Move!
                            </button>

                            <div className='form-result'>
                                <span className='error-message'>{error}</span><span className='success-message'>{success}</span>
                            </div>
                        </div>
                    </div>
                    <div className='type-selection-wrapper'>
                        <h4>Select one type!</h4>
                        <div className='type-selection'>
                            {[
                                ...types.filter(t => selectedTypes.includes(t.id)),
                                ...types.filter(t => !selectedTypes.includes(t.id))
                            ].map(type => (
                                <div className='type' onClick={() => selectType(type.id)} key={type.id} style={{ backgroundColor: `var(--clr-${type.name})` }}>
                                    <div className='type-img' style={{ background: `var(--pic-${type.name})` }} />
                                    <div className='type-name'>
                                        {type.name}
                                    </div>
                                    {selectedTypes.includes(type.id) ? (
                                        <>
                                            <div className="indication selected">
                                                <i className="bi bi-check-lg"></i>
                                            </div>
                                            <div className="indication unselect">
                                                <i className="bi bi-plus-lg"></i>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="indication selectable">
                                            <i className="bi bi-plus-lg"></i>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateMove