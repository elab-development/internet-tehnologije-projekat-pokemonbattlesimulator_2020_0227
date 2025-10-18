import React from 'react'
import { useNavigate } from 'react-router-dom'
import './../css/Util/UserCardSmall.scss'

const UserCardSmall = ({ val, onClickMessage }) => {
    const navigate = useNavigate();
    return (
        <div className='user-card-small'>
            <div className='user-card-small-info'>
                <p className='ucs-username'>{val.username}</p>
                <hr />
                <p className='ucs-other'>
                    <span className='ucs-id'>{"id → " + val.id}</span>
                    <span className='ucs-created-at'>{"created at → " + new Date(val.createdAt).toLocaleDateString('en-us', { day: "numeric", month: "short", year: "numeric" })}</span>
                </p>
            </div>
            <div className='user-card-small-action'>
                <button className='button-full' onClick={() => navigate(`/users/${val.id}`)}>more info</button>
                <button className='button-full' onClick={() => onClickMessage(val.id)}>chat</button>
            </div>
        </div>
    )
}

export default UserCardSmall