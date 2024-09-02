import React, { useContext, useEffect, useState } from 'react'
import { socket } from './sockets/sockets';
import Message from './utils/Message';
import { UserContext } from '../contexts/UserContextProvider';
import InputField from './utils/InputField';

const Chat = ({ friendsSearchOpen = false, ...props }) => {
    const { info } = useContext(UserContext);
    const [componentMounting, setComponentMounting] = useState(true);
    const [messageText, setMessageText] = useState("");                 // INPUT          -> Message to be sent to (friendSearchOpen && selectedUser ) || global
    const [friendSearchQuery, setFriendSearchQuery] = useState("");     // SEARCH / INPUT -> String to search users
    const [giphyQuery, setGiphyQuery] = useState("");                   // SEARCH / INPUT -> String to search in giphy
    const [friendSearchList, setFriendSearchList] = useState([]);       // LIST           -> QUERY RESULT
    const [friendList, setFriendList] = useState([]);                   // LIST           -> LOADED FROM MEMORY + ALL RECEIVED

    const [isOpenPM, setIsOpenPM] = useState(false);                    // STATE          -> PRIVATE MESSAGE OR GLOBAL
    const [isOpenGiphy, setIsOpenGiphy] = useState(false);              // STATE          -> GIPHY SEARCH

    const [selectedUser, setSelectedUser] = useState({});
    const [privateMessages, setPrivateMessages] = useState([]);
    const [globalMessages, setGlobalMessages] = useState([]);

    useEffect(() => {
        function onGlobalMessageReceived(data) {
            setGlobalMessages(prev => [...prev, data]);
        }
        function onPrivateMessageReceived(data) {
            setPrivateMessages(prev => [...prev, data])
        }

        socket.on('message:global:received', onGlobalMessageReceived);
        socket.on('message:private:received', onGlobalMessageReceived);

        setComponentMounting(false);
        return () => {
            socket.off('message:global:received', onGlobalMessageReceived);
            socket.off('message:private:received', onPrivateMessageReceived);
        }
    }, [])

    useEffect(() => {
        if (friendsSearchOpen === true) {
            setIsOpenPM(true);
            setIsOpenGiphy(false);
        }
    }, [friendsSearchOpen]);


    const handleInput = () => {
        if (friendsSearchOpen) {
            return friendSearchQuery;
        } else if (isOpenGiphy) {
            return giphyQuery;
        } else {
            return messageText;
        }
    }


    if (componentMounting) {
        <div className='chat-loading'>
            <p> Loading chat...</p>
        </div>
    }

    return (
        <div className='chat'>
            <div className='chat-first-row'>
                <div>global</div><div>friends</div>
            </div>
            <div className='chat-second-row'>
                <div className='chat-main-tab'>
                    {
                        friendsSearchOpen && isOpenPM ? ( // This one is for people search
                            <>
                                
                            </>
                        ) : ( // This one is for messages
                            <>
                                <div className='chat-messages'>
                                    {isOpenPM ? privateMessages.filter((val) => {
                                        return val.sender.id === selectedUser.id || val.receiver.id === selectedUser.id
                                    }).map((val, index) => {
                                        <Message key={index} username={val.sender.username} text={val.message} us={info.id === val.sender.id} />
                                    }) : globalMessages.map((val, index) => {
                                        <Message key={index} username={val.sender.is} text={val.message} us={info.id === val.sender.id} />
                                    })}
                                </div>
                            </>
                        )
                    }
                </div>
            </div>
            <form className='chat-third-row'>
                <InputField onChange={handleChange} value={handleInput()} />
                <button>{friendsSearchOpen || isOpenGiphy ? "Search" : "Send"}</button>
            </form>
        </div>
    )
}

export default Chat