import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { socket } from './sockets/sockets';
import { UserContext } from '../contexts/UserContextProvider';
import UserFriendCard from './utils/UserFriendCard';
import Message from './utils/Message';
import { addFetchedMessages, addNewPrivateMessage, addPrivateMessages, sendGlobalMessage, sendPrivateMessageTo } from './utils/chatEvents';
import useDebounce from './utils/useDebounce';
import UserCardSmall from './utils/UserCardSmall';
import axios from 'axios';
import './css/Auth/Chat.scss'
import { getGifs } from './utils/api/services/gifServices';
import { getUserById, getUsers } from './utils/api/services/userServices';
import { getMessages } from './utils/api/services/messageServices';
import { parseUserToFriend } from './utils/api/parsers/userParser';

/**
 * @typedef {import('./typedefs/chatTypeDefs').FriendUser} FriendUser
 * @typedef {import('./typedefs/chatTypeDefs').GlobalMessage} GlobalMessage
 * @typedef {import('../../../backend/utils/typedefs').UserSelect} UsersResult
 * @typedef {{id: number, fetched: boolean}} NamespaceInfo
 */
/**@type {0} */
const GLOBAL_NAMESPACE = 0;

const ChatV2 = () => {
    const { info } = useContext(UserContext);

    const [loaded, setLoaded] = useState({ friends: false, namespace: true, tenor: false }); // true -> because global has no load

    /**@type {[FriendUser[], React.Dispatch<React.SetStateAction<FriendUser[]>>]} */          // FRIENDS
    const [friends, setFriends] = useState([]);
    /**@type {[NamespaceInfo, React.Dispatch<React.SetStateAction<NamespaceInfo>>]}*/         // SELECTED FRIEND ID
    const [selectedNamespace, setSelectedNamespace] = useState({ id: GLOBAL_NAMESPACE, fetched: false });
    const selectedNamespaceIDRef = useRef(selectedNamespace.id);
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

    const inputRef = useRef(null);

    const addFriends = useCallback((friends) => {
        setFriends(prev => Array.isArray(friends) ? [...prev, ...friends] : [...prev, friends]);
    }, [])
    const changeNamespace = useCallback((namespaceId) => {
        let fetched = false;
        if (namespaceId !== GLOBAL_NAMESPACE) {
            let friend = friends.find((val) => val.id === namespaceId); // Ako ga ima 
            if (friend !== undefined) {                                 // proveri da li ima poruke fetched
                fetched = !!friend.fetched;
            }
        }
        setLoaded(prev => ({ ...prev, namespace: false }));
        setSelectedNamespace({ id: namespaceId, fetched: fetched });
    }, [friends])


    const handleOnClickNamespace = useCallback((namespaceId) => {
        inputRef.current.focus();
        changeNamespace(namespaceId)
    }, [changeNamespace]);

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
        if (messageText.trim().length === 0) {
            return;
        }

        if (selectedNamespace.id === GLOBAL_NAMESPACE) {
            sendGlobalMessage(messageText);
        } else {
            console.log('selectedNamespace', selectedNamespace)
            console.log('text', messageText);
            sendPrivateMessageTo(selectedNamespace.id, messageText);
        }

        setMessageText("");
    }
    const handleOpenFriend = () => {
        setIsFriendSearchOpen(prev => !prev);
    }

    // EVENT REGISTRATION
    useEffect(() => {
        function onGlobalMessageReceived(data) {
            console.log(data);
            setIsNewGlobal(true);
            setGlobalMessages(prev => [data, ...prev]);
        }
        function onPrivateMessageReceived(data) {
            console.log("private", data);
            addNewPrivateMessage(info.id, data, setFriends, selectedNamespaceIDRef.current);
        }

        socket.on('message:global:received', onGlobalMessageReceived);
        socket.on('message:private:received', onPrivateMessageReceived);

        return () => {
            socket.off('message:global:received', onGlobalMessageReceived);
            socket.off('message:private:received', onPrivateMessageReceived);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [info.id]);

    // UPDATE THE selectedNamespaceIDRef TO HINT HANDLER TO/NOT TO SET "newMessage" PARAMETER
    useEffect(() => {
        selectedNamespaceIDRef.current = selectedNamespace.id;
    }, [selectedNamespace]);

    // INITAL LOAD FOR FRIENDS
    useEffect(() => {
        let friends = localStorage.getItem('friends');
        try {
            friends = JSON.parse(friends ?? undefined);
        } catch (error) {
            friends = []; localStorage.setItem('friends', JSON.stringify(friends))
        }
        if (friends.length <= 0) {
            return setLoaded(prev => ({ ...prev, friends: true }));
        }

        getUsers({ ids: friends })
            .then((users) => setFriends(users.map(parseUserToFriend)))
            .catch((err) => console.error(err))
            .finally(() => setLoaded(prev => ({ ...prev, friends: true })));
    }, [addFriends]);

    // UPDATES LOCAL STORAGE  async to offload the app
    useEffect(() => {
        (async () => { if (friends.length > 0) try { localStorage.setItem('friends', JSON.stringify(friends.map(v => v.id))) } catch (error) { console.error(error) } })();
    }, [friends])

    // LOAD MESSAGES FOR SELECTED NAMESPACE AND LOAD THE USER UP THE FRIENDS LIST
    useEffect(() => {
        console.log("namespace changed", selectedNamespace);
        if (selectedNamespace.id === GLOBAL_NAMESPACE) {
            setIsNewGlobal(false);
        }
        if (selectedNamespace.id === GLOBAL_NAMESPACE || selectedNamespace.fetched) { // Everything is already loaded
            setLoaded(prev => ({ ...prev, namespace: true }))
            return;
        }

        console.log("fetching messages for this namespace");
        getUserById(selectedNamespace.id)
            .then(async (user) => {
                const messages = await getMessages({ user1: info.id, user2: user.id });
                addFetchedMessages(user, messages, setFriends);
                // Ako me u budućnosti bude zanimalo što ovako, pa nema zašta da imam finally block
                //  kad će ovaj useEffect se opet pokrenuti i gore namestiti
                setLoaded(prev => ({ ...prev, namespace: true }));
                setIsFriendSearchOpen(false);
            })
            .catch((err) => {
                setSelectedNamespace({ id: GLOBAL_NAMESPACE, fetched: true });
                console.error(err);
            });
    }, [selectedNamespace, info.id])

    // UPDATES USERS QUERY RESULT WHEN DEBOUNCED SERACH IS CHANGED
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        //setLoaded(prev => ({...prev, usersQuery: false})) -> AKO ME NE BUDE MRZELO
        getUsers({ searchQuery: usersQueryDebounced }, signal)
            .then((users) => setUsersQueryResult(users))
            .catch((err) => {
                if (axios.isCancel(err)) console.log("All good 👍: cancelled old request");
                else console.error(err);
            });

        return () => {
            controller.abort();
        }
    }, [usersQueryDebounced]);

    // UPDATES TENOR GIFS QUERY RESULT WHEN DEBOUNCED SERACH IS CHANGED
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        getGifs({ searchQuery: tenorQueryDebounced }, signal)
            .then((gifs) => setTenorQueryResult(gifs))
            .catch((err) => axios.isCancel(err) ? console.log("All good 👍: cancelled old request") : console.error(err))
            .finally(() => {
                setLoaded(prev => ({ ...prev, tenor: false }))
            });

        return () => {
            controller.abort();
        }
    }, [tenorQueryDebounced]);


    return (
        <div className='chat-page'>
            <div className='chat-header'>
                <h2>Chat</h2>
                <h3>Welcome, {info.username}</h3>
            </div>
            <div className="chat">
                <div className='chat-and-friends'>
                    <div className='content-box'>
                        {
                            isFriendSearchOpen ? (
                                <div className='friends-query'>
                                    {
                                        usersQuery !== usersQueryDebounced ? (
                                            <p className='chat-loading-text'>loading...</p>
                                        ) : (
                                            usersQueryResult.map((val, index) => {
                                                return val.id === info.id ? null :
                                                    <UserCardSmall val={val} onClickMessage={handleOnClickNamespace} key={index} />
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
                                                <div className="gif-column">{tenorQueryResult.map((val, index) => index % 3 !== 0 ? null : <img src={val.mediaFormats.nanogif} alt={val.title} className='nanogif' key={index} onClick={() => { setMessageText(val?.mediaFormats?.tinygif); setIsTenorOpen(false); inputRef.current?.focus() }} />)}</div>
                                                <div className="gif-column">{tenorQueryResult.map((val, index) => index % 3 !== 1 ? null : <img src={val.mediaFormats.nanogif} alt={val.title} className='nanogif' key={index} onClick={() => { setMessageText(val?.mediaFormats?.tinygif); setIsTenorOpen(false); inputRef.current?.focus() }} />)}</div>
                                                <div className="gif-column">{tenorQueryResult.map((val, index) => index % 3 !== 2 ? null : <img src={val.mediaFormats.nanogif} alt={val.title} className='nanogif' key={index} onClick={() => { setMessageText(val?.mediaFormats?.tinygif); setIsTenorOpen(false); inputRef.current?.focus() }} />)}</div>
                                            </>
                                        )
                                    }
                                </div>
                            ) : loaded.namespace ? (
                                <div className='chat-box'>
                                    {
                                        selectedNamespace.id === GLOBAL_NAMESPACE ? (
                                            globalMessages.map((val, index) =>
                                                <Message text={val.message} us={val.id === info.id} username={val.username} key={index} />
                                            )
                                        ) : (
                                            friends.find((user) => user.id === selectedNamespace.id).messages.map((val, index) =>
                                                <Message text={val.message} us={val.sender.id === info.id} username={val.sender.username} key={index} />
                                            )
                                        )
                                    }
                                </div>
                            ) : (
                                <p className='chat-loading-text'>loading...</p>
                            )
                        }
                    </div>
                    <div className='friend-box'>
                        <div className='friend-box-inner-wrapper'>
                            <UserFriendCard val={{ id: 0, username: 'global' }} key={0} onClickMessage={handleOnClickNamespace} highlight={selectedNamespace.id === GLOBAL_NAMESPACE} isNewMessage={isNewGlobal} />
                            <hr key="hr" />
                            {
                                loaded.friends ?
                                    (<>
                                        {friends.map((val) => <UserFriendCard val={val} key={val.id} onClickMessage={handleOnClickNamespace} highlight={val.id === selectedNamespace.id} isNewMessage={val.newMessage} />)}
                                    </>)
                                    : (
                                        <p className='chat-loading-text'>loading...</p>
                                    )
                            }
                        </div>
                        <div className='find-friends-button'>
                            <button type='button' className='button-full' onClick={handleOpenFriend}>{isFriendSearchOpen ? "close finder" : "find friends!"}</button>
                        </div>
                    </div>
                </div>
                <form className='send-message-wrapper' onSubmit={handleSendMessage}>
                    <input className='input-message' name='input' type='text' onChange={handleInput} value={isFriendSearchOpen ? usersQuery : (isTenorOpen ? tenorQuery : messageText)} autoComplete='off' ref={inputRef} />
                    {isFriendSearchOpen || isTenorOpen ? null : <button type="submit" className='button-full'>send</button>}
                    {isFriendSearchOpen ? null : <button className='button-full' onClick={() => setIsTenorOpen(prev => !prev)}>{isTenorOpen ? "close gif" : "open gif"}</button>}
                </form>
            </div>
        </div>
    )
}

export default ChatV2