import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

// components
import {
   MessageFormContainer,
   StyledMessageForm,
   SendMessageBtn,
} from './MessageForm.styled';

// React icons Font-Awesome
import { FaRegPaperPlane } from 'react-icons/fa';

// context
import { useAuthContext } from '../../context/AuthContext';
import { useMessageContext, MSG_ACTIONS } from '../../context/MessagesContext';

const SEND_URL = 'http://localhost:5000/api/messages';
const REGEX = /^\s*$/;

const MessageForm = ({ socket }) => {
   const { user } = useAuthContext();
   const { dispatch } = useMessageContext();
   const [text, setText] = useState('');
   const [containsWhitespace, setContainsWhitespace] = useState(true);

   const handleChange = e => {
      setText(e.target.value);
   };

   const handleSubmit = async e => {
      e.preventDefault();
      try {
         const response = await fetch(SEND_URL, {
            method: 'POST',
            body: JSON.stringify({ text }),
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${user.token}`,
            },
         });
         const result = await response.json();

         if (response.ok) {
            dispatch({ type: MSG_ACTIONS.CREATE, payload: result });
            resetForm();
         }
      } catch (error) {
         console.error(error);
      }
   };

   const handleKeyUp = () => {
      const whitespaces = REGEX.test(text);
      setContainsWhitespace(whitespaces);
   };

   const handleKeyDown = e => {
      if (e.key === 'Enter') {
         e.preventDefault();
      }
      if (!e.shiftKey && !containsWhitespace && e.key === 'Enter') {
         e.preventDefault();
         handleSubmit(e);
      }
      if (e.shiftKey && e.key === 'Enter') {
         setText(text + '\r\n');
      }
      if (e.key === 'Tab') {
         e.preventDefault();
         setText(text + '\t');
      }
   };

   const resetForm = () => {
      setText('');
   };

   return (
      <MessageFormContainer>
         <StyledMessageForm onSubmit={handleSubmit}>
            <label htmlFor="text" />
            <TextareaAutosize
               type="text"
               value={text}
               onChange={handleChange}
               id="text"
               name="text"
               onKeyDown={handleKeyDown}
               onKeyUp={handleKeyUp}
               maxRows={4}
            />
            <SendMessageBtn
               disabled={text && !containsWhitespace ? false : true}
               title="Send message"
            >
               <FaRegPaperPlane />
            </SendMessageBtn>
         </StyledMessageForm>
      </MessageFormContainer>
   );
};

export default MessageForm;
