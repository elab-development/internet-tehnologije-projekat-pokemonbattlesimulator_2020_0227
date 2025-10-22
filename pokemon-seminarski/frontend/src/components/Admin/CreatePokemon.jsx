import React, { useCallback, useEffect, useState } from 'react'
import Collection, { pokeGITAPI } from '../Collection'
import '../css/Admin/CreatePokemon.scss'
import TypeWritter from '../utils/TypeWritter'
import InputField from '../utils/InputField'
import { z } from 'zod';
import { getAllMoves } from '../utils/api/services/moveService'
import { getAllTypes } from '../utils/api/services/typeService'
import { createPokemon } from '../utils/api/services/pokemonService'

/**@typedef {import('../typedefs/pokemonTypeDefs').Move} Move*/
/**@typedef {import('../typedefs/pokemonTypeDefs').Type} Type*/

const inputMap = {
  "pokemon-id": "id",
  "defense": "def",
  "health-points": "hp",
  "pokemon-evolve-id": "evoID"
}

const validationSchema = z.object({
  id: z.coerce.number().int(),
  def: z.coerce.number().int(),
  hp: z.coerce.number().int(),
  evoID: z.coerce.number().int().optional(),
  moves: z.number().int().array().length(3),
  types: z.number().int().array().min(1).max(2)
})

const CreatePokemon = () => {
  /**@type {[moves: Move[], React.Dispatch<React.SetStateAction<Move[]>>]} */
  const [moves, setMoves] = useState([]);
  /**@type {[moves: number[], React.Dispatch<React.SetStateAction<number[]>>]} */
  const [selectedMoves, setSelectedMoves] = useState([]);
  /**@type {[moves: Type[], React.Dispatch<React.SetStateAction<Type[]>>]} */
  const [types, setTypes] = useState([]);
  /**@type {[moves: number[], React.Dispatch<React.SetStateAction<number[]>>]} */
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);

  const [errorImage, setErrorImage] = useState(false);

  const [{ id, def, hp, evoID }, setInputs] = useState({
    id: "",
    def: "",
    hp: "",
    evoID: "",
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

    const pokemon = validationSchema.safeParse({ id, def, hp, evoID, moves: selectedMoves, types: selectedTypes })
    if (!pokemon.success) {
      setLoadingResponse(false);
      return setError(pokemon.error.issues[0].message);
    }

    console.log("submited", pokemon)
    createPokemon(pokemon.data)
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

  const selectMove = (id) => {
    const move = selectedMoves.findIndex(sm => sm === id)
    if (move > -1) {
      selectedMoves.splice(move, 1);
      setSelectedMoves([...selectedMoves])
    } else if (selectedMoves.length < 3) {
      selectedMoves.push(id);
      setSelectedMoves([...selectedMoves])
    }
  }

  const selectType = (id) => {
    const type = selectedTypes.findIndex(st => st === id)
    if (type > -1) {
      selectedTypes.splice(type, 1);
      setSelectedTypes([...selectedTypes])
    } else if (selectedTypes.length < 2) {
      selectedTypes.push(id);
      setSelectedTypes([...selectedTypes])
    }
  }

  const handleWrongImage = () => {
    setErrorImage(true);
  }

  useEffect(() => {
    getAllMoves().then((result) => {
      setMoves(result);
    }).catch((err) => console.error("Coudln't load moves", err));
    getAllTypes().then((result) => {
      setTypes(result);
    }).catch((err) => console.error("Coudln't load types", err));
  }, [])

  useEffect(() => {
    setErrorImage(false);
  }, [id])

  return (
    <div className='create-pokemon'>
      <div className='form-wrapper'>
        <form onSubmit={handleSubmit}>
          <div className='fields-wrapper'>
            <div className='fields'>
              <div className='form-result'>
                <span className='error-message'>{error}</span><span className='success-message'>{success}</span>
              </div>
              <div className='base-inputs'>
                <div className='input-item'>
                  <label htmlFor="pokemon-id"><TypeWritter text="Pokemon ID" totalDuration={500} /></label>
                  <InputField id='pokemon-id' type='text' value={id} onChange={handleChange} />
                </div>
                <div className='input-item'>
                  <label htmlFor="defense"><TypeWritter text="Defense" totalDuration={500} /></label>
                  <InputField id='defense' type='text' value={def} onChange={handleChange} />
                </div>
                <div className='input-item'>
                  <label htmlFor="health-points"><TypeWritter text="Health Points" totalDuration={500} /></label>
                  <InputField id='health-points' type='text' value={hp} onChange={handleChange} />
                </div>
                <div className='input-item'>
                  <label htmlFor="pokemon-evolve-id"><TypeWritter text="Evolves to PokemonID >>" totalDuration={500} /></label>
                  <InputField id='pokemon-evolve-id' type='text' value={evoID} onChange={handleChange} />
                </div>
              </div>
              <div className='presentation'>
                <div className='id-representation'>
                  {id && !errorImage && <img src={pokeGITAPI(id)} onError={handleWrongImage} alt='' />}
                  <svg className="no-pokemon" width="33" height="54" viewBox="0 0 33 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.0033.612004c2.281.611296 4.3539 1.541566 6.1506 2.744676 1.7957 1.20295 3.2763 2.63888 4.4473 4.34962 1.1721 1.71091 1.9417 3.606 2.2887 5.7008.3735 2.0786.2123 4.2782-.399 6.5592-1.0944 4.0836-2.944 6.9644-5.6124 8.6708-2.6417 1.6893-5.8425 2.423-9.6246 2.2004l-.3511 1.3102c-.2793 1.0419-.7699 1.9139-1.4412 2.5958-.6435.6651-1.4496 1.0962-2.3758 1.3366-.8977.2246-1.836.2101-2.83446-.0575-.99942-.2678-1.838-.7294-2.52575-1.379-.65923-.6652-1.10122-1.4309-1.34762-2.3344-.21862-.9204-.1887-1.9159.0905-2.9578l1.43649-5.3602c.29692-1.1079.73311-1.9385 1.34598-2.4024.61312-.4649 1.28597-.6948 1.99526-.7374.7103-.0423 1.7661-.0163 3.1334.0942 3.5569.2775 5.6987-.9747 6.4438-3.755.3027-1.1296.0944-2.2662-.5797-3.4007-.6454-1.151-1.702-1.9037-3.1572-2.2937-1.3468-.3609-2.4781-.3892-3.4-.0779-.8993.3173-1.8362.8932-2.86468 1.6888-.99973.7789-1.93622 1.3337-2.77164 1.6692-.80665.3189-1.80639.3048-2.97946-.0096-1.325-.3551-2.30283-1.1691-2.99029-2.4235-.660652-1.2715-.803605-2.565-.436883-3.93342C1.28366 6.02123 2.61751 4.11784 4.66449 2.73381 6.71136 1.35016 9.0213.496169 11.6225.169028c2.6023-.326977 5.0574-.1796861 7.3808.442976ZM7.6124 41.8107c1.02015.2734 1.89944.8041 2.6447 1.5865.7444.7811 1.2291 1.6755 1.5055 2.7277.3041 1.0354.3187 2.0819.0395 3.1238-.2853 1.0645-.8313 2.001-1.6185 2.7682-.75945.7503-1.63513 1.24-2.68734 1.5163-1.02952.2825-2.03257.2886-3.03101.021-.99943-.2678-1.88374-.7797-2.65674-1.5452-.75031-.7594-1.304213-1.6322-1.609341-2.6678-.2763545-1.0522-.2621251-2.1313.023163-3.1958.279206-1.0419.796418-1.9459 1.555838-2.6962.78818-.7669 1.71436-1.2833 2.74969-1.5874 1.03659-.3049 2.06341-.3247 3.08454-.0511Z" fill="#4A3E65" />
                  </svg>
                </div>
                <div className='submit-wrapper'>
                  <button type='submit' className='button-full' disabled={loadingResponse || !(id && hp && def && errorImage &&selectedMoves.length === 3 && selectedTypes.length > 0)}>
                    Create Pokemon!
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='move-selection-wrapper'>
            <h4>Select 3 moves</h4>
            <div className='move-selection'>
              {[
                ...moves.filter(m => selectedMoves.includes(m.id)),
                ...moves.filter(m => !selectedMoves.includes(m.id))
              ].map((move) => (
                <div key={move.id} className="move" style={{ backgroundColor: `var(--clr-${move.type.name})` }} onClick={() => selectMove(move.id)}>
                  <p className='move-name'><span aria-hidden="true" style={{ background: `var(--pic-${move.type.name})` }} /> {move.name}</p>
                  <div className='move-info-wrap'>
                    <div className='move-info'>
                      <p className='move-dmg-val'>
                        <code>{String(move.attackBase).padStart(3, "0")}</code>
                      </p>
                      <p className='move-dmg'> DMG</p>
                    </div>
                    <div className='move-info'>
                      <p className='move-mna-val'>
                        <code>{String(move.mana).padStart(2, "0")}</code>
                      </p>
                      <p className='move-mna'> MNA</p>
                    </div>
                  </div>
                  {selectedMoves.includes(move.id) ? (
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
          <div className='type-selection-wrapper'>
            <h4>Select 1 - 2 types</h4>
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
      </div >
      <div className='collection-wrapper'>
        <Collection loadAllPokemons />
      </div>
    </div >
  )
}

export default CreatePokemon