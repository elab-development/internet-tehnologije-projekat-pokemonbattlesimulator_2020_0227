import React from 'react'
import { Link } from 'react-router-dom'

const UserCardSmall = ({ val, onClickMessage }) => {
    return (
        <div className='user-card-small'>
            <div className='user-card-small-info'>
                <p className='usc-username'>{val.username}</p>
                <p className='usc-other'>
                    <span className='usc-id'>{"id -> " + val.id}</span>
                    <span className='usc-created-at'>{val.createdAt + " <- created at"}</span>
                </p>
            </div>
            <div className='user-card-small-action'>
                <Link className='user-info-button' to={`/user/${val.id}`} >info</Link>
                <button onClick={() => onClickMessage(val.id)}>chat</button>
            </div>
        </div>
    )
}

export default UserCardSmall