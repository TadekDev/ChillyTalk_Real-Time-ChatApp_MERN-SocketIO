import { useState, useEffect } from 'react';

// components
import { MessagesContainer } from './MessageWindow.styled';
import Message from './Message';
import MessageLoadingSkeleton from '../Loader/MessageLoadingSkeleton';

// context
import { useAuthContext } from '../../context/AuthContext';
import { useMessageContext, MSG_ACTIONS } from '../../context/MessagesContext';

const MESSAGES_URL = 'http://localhost:5000/api/messages';

const MessageWindow = ({ socket }) => {
   const { user } = useAuthContext();
   const { messages, dispatch } = useMessageContext();
   const [loading, setLoading] = useState(true);
   const [pageNumber, setPageNumber] = useState(0);

   const fetchMessages = async () => {
      setLoading(true);

      const response = await fetch(`${MESSAGES_URL}?page=0`, {
         headers: { Authorization: `Bearer ${user.token}` },
      });
      const result = await response.json();

      if (response.ok) {
         dispatch({
            type: MSG_ACTIONS.SET,
            payload: [...new Set([...messages, ...result])],
         });
         setLoading(false);
      }
   };

   useEffect(() => {
      if (user) {
         fetchMessages();
      }
      // eslint-disable-next-line
   }, [user, dispatch]);

   useEffect(() => {
      socket.on('resend_messages', () => {
         fetchMessages();
      });
      // eslint-disable-next-line
   }, [socket]);

   return (
      <MessagesContainer>
         {messages?.map((message, index, array) => (
            <Message
               key={message._id}
               message={message}
               nextId={array[index + 1]?.user_id ?? false}
               nextDay={array[index + 1]?.createdAt ?? false}
            />
         )) ||
            (!loading && (
               <div
                  style={{
                     display: 'flex',
                     justifySelf: 'end',
                     alignSelf: 'center',
                     paddingBottom: '10rem',
                  }}
               >
                  Actually there aren't any messages for now ¯\_(ツ)_/¯
               </div>
            ))}
         {loading &&
            [...Array(10).keys()].map(i => {
               return <MessageLoadingSkeleton key={i} index={i} />;
            })}
      </MessagesContainer>
   );
};

export default MessageWindow;
