import React from 'react'

function isValidTenorUrl(url) {
  const regex = /^https:\/\/media\.tenor\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.gif$/;
  return regex.test(url);
}

const Message = ({ username, text, us }) => {
  return (
    <div className={`chat-message${us ? " chat-message-us" : ""}`}>
      <p className='chat-message-username'>{username}</p>
      {
        isValidTenorUrl(text) ? 
        <img src={text} alt="If you can see this that means we couldn't find the image 😕"/> :
        <p className='chat-message-text'>{text}</p>
      }
    </div>
  )
}

export default Message