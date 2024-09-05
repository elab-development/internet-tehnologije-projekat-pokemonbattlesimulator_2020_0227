import React from 'react'


const UserFriendCard = ({ val, highlight, isNewMessage, onClickMessage }) => {
    return (
        <div className={'user-friend' + highlight ? " user-friend-hightlight" : "" + isNewMessage ? " user-friend-pulse" : ""}>
            <div className='user-friend-info'>
                <p className='ufc-username'>{val.username}</p>
            </div>
            <div className='user-card-small-action'>
                {val.id === 0 ? null : <Link className='user-info-button' to={`/user/${val.id}`} >info</Link>}
                <button onClick={() => onClickMessage(val.id)}>chat</button>
            </div>
        </div>
    )
}

export default UserFriendCard