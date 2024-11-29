import React, { useContext, useEffect, useState } from 'react'
import { socket } from './sockets/sockets';
import Message from './utils/Message';
import { UserContext } from '../contexts/UserContextProvider';
import InputField from './utils/InputField';
import UserCardSmall from './utils/UserCardSmall';
import UserFriendCard from './utils/UserFriendCard';
import API from './utils/API';

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

   const [loadingMessages, setLoadingMessages] = useState(false);
   const [loadMessagesMetaData, setLoadMessagesMetaData] = useState(null);
   const [loadMoreMessagesDisabled, setLoadingMoreMessagesDisabled] = useState(false);

   const [selectedUser, setSelectedUser] = useState(null);
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

   // Loading the messagess for given selectedUser
   useEffect(() => {
      if (selectedUser != null) {
         API.get(`/messages?user1=${info.id}&user2=${selectedUser.id}`)
      }
         
   }, [selectedUser])


   const handleInput = () => {
      if (friendsSearchOpen) {
         return friendSearchQuery;
      } else if (isOpenGiphy) {
         return giphyQuery;
      } else {
         return messageText;
      }
   }

   const onClickSelectUser = (user) => {
      setIsOpenPM(true);
      setLoadingMessages(true);
      setSelectedUser(user);
      if (friendList.find((val) => val.id === user.id)) {
         setFriendList(prev => [...prev, user])
      }
   }

   const loadMoreMessages = () => {

   }


   if (componentMounting) {
      return (
         <div className='chat-loading'>
            <p> Loading chat...</p>
         </div>
      )
   }

   return (
      <div className='chat'>
         <div className='chat-first-row'>
            <div onClick={() => setIsOpenPM(false)}>global</div><div onClick={() => setIsOpenPM(true)}>friends</div>
         </div>
         <div className='chat-second-row'>
            <div className='chat-main-tab'>
               {
                  friendsSearchOpen /*&& isOpenPM*/ ? ( // This one is for people search
                     <>
                        {friendSearchList.length === 0 ? "type below to search" : friendSearchList.map((val) => {
                           return <UserCardSmall val={val} key={val.id} onClick={onClickSelectUser} />
                        })}
                     </>
                  ) : ( // This one is for messages
                     <>
                        <div className='chat-messages'>
                           {
                              isOpenPM ? (
                                 loadingMessages ? ("") : (
                                    <>
                                       {/*privateMessages.length > 0 && <button onClick={loadMoreMessages}>load more messages</button>*/}
                                       {privateMessages.map((val, index) => {
                                          return <Message key={index} username={val.sender.id} text={val.message} us={info.id === val.sender.id} />
                                       })}
                                    </>
                                 )
                              ) : (
                                 globalMessages.map((val, index) => {
                                    return <Message key={index} username={val.sender.id} text={val.message} us={info.id === val.sender.id} />
                                 })
                              )
                           }
                        </div>
                     </>
                  )
               }
            </div>

            {
               !isOpenPM ? null : (
                  <div className='friends-side-panel'>
                     {friendList.map((val) => {
                        return <UserFriendCard val={val} key={val.id} onClickMessage={onClickSelectUser} />
                     })}
                  </div>
               )
            }

         </div>
         <form className='chat-third-row'>
            <InputField onChange={handleChange} value={handleInput()} />
            <button onClick={handleSend}>{friendsSearchOpen || isOpenGiphy ? "Search" : "Send"}</button>
         </form>
      </div>
   )
}

export default Chat