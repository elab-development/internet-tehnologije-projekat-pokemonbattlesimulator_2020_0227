import React, { useCallback, useContext, useEffect, useState } from 'react'
import { socket } from './sockets/sockets';
import { UserContext } from '../contexts/UserContextProvider';
import API from './utils/API';
import UserFriendCard from './utils/UserFriendCard';
import Message from './utils/Message';
import { addPrivateMessages, sendGlobalMessage, sendPrivateMessageTo } from './utils/chatEvents';
import useDebounce from './utils/useDebounce';
import UserCardSmall from './utils/UserCardSmall';
import axios from 'axios';

/**
 * @typedef {import('./typedefs/chatTypeDefs').FriendUser} FriendUser
 * @typedef {import('./typedefs/chatTypeDefs').GlobalMessage} GlobalMessage
 * @typedef {import('../../../backend/utils/typedefs').UserSelect} UsersResult
 * @typedef {{id: number, fetched: boolean}} NamespaceInfo
 */

const GLOBAL_NAMESPACE = 0;

const ChatV2 = () => {
    const { info } = useContext(UserContext);

    const [loaded, setLoaded] = useState({ friends: false, namespace: true, tenor: false }); // true -> because global has no load

    /**@type {[FriendUser[], React.Dispatch<React.SetStateAction<FriendUser[]>>]} */          // FRIENDS
    const [friends, setFriends] = useState([]);
    /**@type {[NamespaceInfo, React.Dispatch<React.SetStateAction<NamespaceInfo>>]}*/         // SELECTED FRIEND ID
    const [selectedNamespace, setSelectedNamespace] = useState({ id: GLOBAL_NAMESPACE, fetched: false });
    /**@type {[GlobalMessage[], React.Dispatch<React.SetStateAction<GlobalMessage[]>>]} */    // GLOBALMESSAGES -> ID === 0
    const [globalMessages, setGlobalMessages] = useState([]);
    const [isNewGlobal, setIsNewGlobal] = useState(false);

    const [isFriendSearchOpen, setIsFriendSearchOpen] = useState(false);
    /**@type {[UsersResult[], React.Dispatch<React.SetStateAction<UsersResult[]>>]} */
    const [usersQueryResult, setUsersQueryResult] = useState([]);
    const [usersQuery, setUsersQuery] = useState("");
    const usersQueryDebounced = useDebounce(usersQuery);

    const [messageText, setMessageText] = useState("");

    const [tenorQuery, setTenorQuery] = useState("");
    const [isTenorOpen, setIsTenorOpen] = useState(false);
    const [tenorQueryResult, setTenorQueryResult] = useState([]);
    const tenorQueryDebounced = useDebounce(tenorQuery);


    const addFriends = useCallback((friends) => {
        setFriends(prev => Array.isArray(friends) ? [...prev, ...friends] : [...prev, friends]);
    }, [])
    const changeNamespace = useCallback((namespaceId) => {
        let fetched = false;
        if (friends.find((val) => val.id === namespaceId).fetched) {
            fetched = true;
        }
        setLoaded(prev => ({ ...prev, namespace: false }));
        setSelectedNamespace({ id: namespaceId, fetched: fetched });
    }, [friends])


    const handleOnClickNamespace = (namespaceId) => {
        changeNamespace(namespaceId)
    }
    const handleOpenNewChat = async (namespaceId) => {
        if (info.id === namespaceId) return;
        if (friends.every((val) => val.id !== namespaceId)) {
            let user;
            try {
                user = (await API.get(`/users/${namespaceId}`)).data
                setFriends(prev => [...prev, user]);
            } catch (error) {
                console.error(error);
                return;
            }
        }
        changeNamespace(namespaceId)
    }
    const handleInput = (e) => {
        e.preventDefault();
        const { value } = e.target;
        if (isFriendSearchOpen) {
            setUsersQuery(value);
        } else if (isTenorOpen) {
            setTenorQuery(value);
        } else {
            setMessageText(value);
        }
    }
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (selectedNamespace.id === GLOBAL_NAMESPACE) {
            sendGlobalMessage(messageText);
        } else {
            sendPrivateMessageTo(selectedNamespace, messageText);
        }
    }
    const handleOpenFriend = () => {
        setIsFriendSearchOpen(prev => !prev);
    }


    // EVENT REGISTRATION
    useEffect(() => {
        function onGlobalMessageReceived(data) {
            console.log(data);
            setIsNewGlobal(true);
            setGlobalMessages(prev => [...prev, data]);
        }
        function onPrivateMessageReceived(data) {
            addPrivateMessages(info.id, data.messages, setFriends, { newMessage: true });
        }

        socket.on('message:global:received', onGlobalMessageReceived);
        socket.on('message:private:received', onPrivateMessageReceived);

        return () => {
            socket.off('message:global:received', onGlobalMessageReceived);
            socket.off('message:private:received', onPrivateMessageReceived);
        }
    }, [info.id]);

    // INITAL LOAD FOR FRIENDS
    useEffect(() => {
        let friends = localStorage.getItem('friends');
        try {
            friends = JSON.parse(friends ?? undefined);
        } catch (error) {
            console.log(error.message);
            friends = [];
            localStorage.setItem('friends', JSON.stringify(friends))
        }
        console.log('Friends i have: ', friends);
        API.get('/users', {
            params: { users: friends, l: 'y' }
        }).then((result) => {
            console.log(result);
            console.log('Friends data i found: ', result.data);
            addFriends(result.data.data.map((user) => ({ ...user, fetched: false, newMessage: false })));
            setLoaded(prev => ({ ...prev, friends: true }))
        }).catch((err) => {
            // NO FRIENDS FOUND OR QUERY IS BAD
            setLoaded(prev => ({ ...prev, friends: true }));
            console.error(err);
        });
    }, [addFriends]);

    // LOAD MESSAGES FOR SELECTED NAMESPACE
    useEffect(() => {
        if (selectedNamespace.id === GLOBAL_NAMESPACE || selectedNamespace.fetched === true) { // Everything is already loaded
            setLoaded(prev => ({ ...prev, namespace: true }))
            return;
        }

        API.get(`/messages?user1=${info.id}&user2=${selectedNamespace.id}&direction=both`).then((result) => {
            console.log(result.data);
            const messages = result.data.data;
            addPrivateMessages(info.id, messages, setFriends, { fetched: true });
            setLoaded(prev => ({ ...prev, namespace: true }));
        }).catch((err) => {
            //changeNamespace(GLOBAL_NAMESPACE);
            setSelectedNamespace({ id: GLOBAL_NAMESPACE, fetched: true });
            console.error(err);
        });
    }, [selectedNamespace, info.id])

    // UPDATES LOCAL STORAGE
    useEffect(() => {
        (async () => { // async to offload the app
            if (friends.length > 0) {
                try {
                    const jsonified = JSON.stringify(friends);
                    localStorage.setItem('friends', jsonified);
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    }, [friends])

    // UPDATES USERS QUERY RESULT WHEN DEBOUNCED SERACH IS CHANGED
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        //setLoaded(prev => ({...prev, usersQuery: false})) -> AKO ME NE BUDE MRZELO
        API.get(`/users?usernameQuery=${usersQueryDebounced}`, { signal: signal }).then((result) => {
            console.log(result);
            setUsersQueryResult(result.data.data);
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log("All good 👍: cancelled old request");
            } else {
                console.error(err);
            }
        });

        return () => {
            controller.abort();
        }
    }, [usersQueryDebounced]);

    // UPDATES TENOR GIFS QUERY RESULT WHEN DEBOUNCED SERACH IS CHANGED
    useEffect(() => {
        setLoaded(prev => ({ ...prev, tenor: false }));
    }, [])
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        API.get(`/gifs/search?q=${tenorQueryDebounced}`, { signal: signal }).then((result) => {
            setTenorQueryResult(result.data.data);
        }).catch((err) => {
            if (axios.isCancel(err)) {
                console.log("All good 👍: cancelled old request");
            } else {
                console.error(err);
            }
        }).finally(() => {
            setLoaded(prev => ({ ...prev, tenor: false }))
        });

        return () => {
            controller.abort();
        }
    }, [tenorQueryDebounced]);




    return (
        <div className='chat'>
            <div className='chat-and-friends'>
                <div className='chat-box'>
                    {
                        isFriendSearchOpen ? (
                            <div className='friends-query'>
                                {
                                    usersQuery !== usersQueryDebounced ? (
                                        <p className='chat-loading-text'>loading...</p>
                                    ) : (
                                        usersQueryResult.map((val, index) => {
                                            return val.id === info.id ? null :
                                                <UserCardSmall val={val} onClickMessage={handleOpenNewChat} key={index} />
                                        })
                                    )
                                }
                            </div>
                        ) : isTenorOpen ? (
                            <div className='gif-query'>
                                {
                                    tenorQuery !== tenorQueryDebounced ? (
                                        <p className='chat-loading-text'>loading...</p>
                                    ) : (
                                        <>
                                            <div className="gif-column">{tenorQueryResult.map((val, index) => index % 3 !== 0 ? null : <img src={val.mediaFormats.nanogif} alt={val.title} className='nanogif' key={index} onClick={() => { setMessageText(val.tinygif); setIsTenorOpen(false) }} />)}</div>
                                            <div className="gif-column">{tenorQueryResult.map((val, index) => index % 3 !== 1 ? null : <img src={val.mediaFormats.nanogif} alt={val.title} className='nanogif' key={index} onClick={() => { setMessageText(val.tinygif); setIsTenorOpen(false) }} />)}</div>
                                            <div className="gif-column">{tenorQueryResult.map((val, index) => index % 3 !== 2 ? null : <img src={val.mediaFormats.nanogif} alt={val.title} className='nanogif' key={index} onClick={() => { setMessageText(val.tinygif); setIsTenorOpen(false) }} />)}</div>
                                        </>
                                    )
                                }
                            </div>
                        )
                            : (
                                loaded.namespace ?
                                    (
                                        selectedNamespace.id === GLOBAL_NAMESPACE ? globalMessages.map((val, index) =>
                                            <Message text={val.message} us={val.id === info.id} username={val.username} key={index} />
                                        ) : friends.find((user) => user.id === selectedNamespace).messages.map((val) =>
                                            <Message text={val.message} us={val.sender.id === info.id} username={val.sender.username} />
                                        )
                                    ) :
                                    (
                                        <p className='chat-loading-text'>loading...</p>
                                    )
                            )
                    }
                </div>
                <div className='friend-box'>
                    <div className='friend-box-inner-wrapper'>
                        <UserFriendCard val={{ id: 0, username: 'global' }} onClickMessage={handleOnClickNamespace} highlight={selectedNamespace === 0} isNewMessage={isNewGlobal} />
                        <br />
                        {
                            loaded.friends ?
                                (<>
                                    {friends.map((val) => <UserFriendCard val={val} key={val.id} onClickMessage={handleOnClickNamespace} highlight={val.id === selectedNamespace} isNewMessage={val.newMessage} />)}
                                </>)
                                : (
                                    <p className='chat-loading-text'>loading...</p>
                                )
                        }
                    </div>
                    <div className='find friends button'>
                        <button type='button' onClick={handleOpenFriend}>find friends!</button>
                    </div>
                </div>
            </div>
            <div className='send-message-wrapper'>
                <input className='input-message' name='input' type='text' onChange={handleInput} value={isFriendSearchOpen ? usersQuery : (isTenorOpen ? tenorQuery : messageText)} />
                {isFriendSearchOpen || isTenorOpen ? null : <button className='send-message-button' onClick={handleSendMessage}>send</button>}
                {isFriendSearchOpen ? null : <button className='open-tenor-explore' onClick={() => setIsTenorOpen(prev => !prev)}>open gif</button>}
            </div>
        </div>
    )
}

export default ChatV2