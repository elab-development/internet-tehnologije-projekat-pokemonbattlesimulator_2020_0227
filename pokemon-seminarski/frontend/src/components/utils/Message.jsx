import React from 'react'

const Message = ({username, text, us}) => {
  return (
    <div className={`chat-message${us ? " chat-message-us": ""}`}>
        <p className='chat-message-username'>{username}</p>
        <p className='chat-message-text'>{text}</p>
    </div>
  )
}

export default Message