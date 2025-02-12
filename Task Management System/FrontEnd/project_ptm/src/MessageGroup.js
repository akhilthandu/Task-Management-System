// MessageGroup.js
import React, { useState, useEffect, useRef} from 'react';
import axios from 'axios';
import './MessageGroup.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const MessageGroup = ({ projectId, userId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [prevMessages, setPrevMessages] = useState([]);
  const [isNewMessage, setIsNewMessage] = useState(false); // Track new messages

  const messagesEndRef = useRef(null);
  
  // Fetch messages periodically
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const encodedData = new URLSearchParams();
        encodedData.append('id', projectId);
        const response = await fetch(`${backendUrl}/api/projects/messages`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: encodedData.toString(),
        });

        const Responsedata = await response.json();
        //console.log(Responsedata);

        const sortedMessages = Responsedata.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (sortedMessages.length !== messages.length) {
            setIsNewMessage(true); // Mark as new message to trigger scroll
        }

        setMessages(sortedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Clean up on component unmount
  }, [projectId]);

    // Scroll to bottom when new message is added
    useEffect(() => {
            if (isNewMessage && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            setIsNewMessage(false); // Reset flag after scrolling
            }
        }, [messages, isNewMessage]); // Trigger scroll effect on new messages

  // Get username from userId
  const getUsername = async () => {
    try {
        const encodedData = new URLSearchParams();
        encodedData.append('id', userId); // Send member _id to fetch their name
        const response = await fetch(`${backendUrl}/api/projects/fetchUserName`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: encodedData.toString(),
        });

        const Responsedata = await response.json();
    
      return Responsedata.name;
    } catch (error) {
      console.error("Error fetching username:", error);
      return '';
    }
  };

  // Send message
  const handleSend = async () => {
    if (!message.trim()) return;

    const username = await getUsername();
    const formattedMessage = `${username} | ${message}`;

    try {
      const encodedData = new URLSearchParams();
        encodedData.append('id', projectId); // Send member _id to fetch their name
        encodedData.append('msg', formattedMessage);
        const response = await fetch(`${backendUrl}/api/projects/send`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: encodedData.toString(),
        });

        const Responsedata = await response.json();
        console.log(Responsedata);
      if (Responsedata.success === true) {
        setMessage('');
      } else {
        console.error('Message sending failed');
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="message-group">
        <h4><strong>Comments</strong></h4>
      <div className="messages">
        {messages.map((msg, index) => {
          const [username, messageContent] = msg.content.split(' | ');
          return (
            <div key={index} className="message">
              <strong>{username}:</strong> {messageContent}
            </div>
          );
        })}
      </div>

      <div className="message-input">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        ></textarea>
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default MessageGroup;
