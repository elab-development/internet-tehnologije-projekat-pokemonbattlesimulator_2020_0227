import React from 'react'
import { Link } from 'react-router-dom'
import '../css/Util/UserFriendCard.scss'

const UserFriendCard = ({ val, highlight, isNewMessage, onClickMessage }) => {
    return (
        <div className={'user-friend' + (highlight ? " user-friend-highlight" : "") + (isNewMessage ? " user-friend-pulse" : "")}>
            <div className='user-friend-info'>
                <p className='ufc-username'>{val.username}</p>
            </div>
            <div className='user-friend-card-small-action'>
                {val.id === 0 ? null : <Link className='user-info-button' to={`/user/${val.id}`} >info</Link>}
                <button type="button" className="button-anchor" onClick={() => onClickMessage(val.id)}>chat</button>
            </div>
        </div>
    )
}

export default UserFriendCard