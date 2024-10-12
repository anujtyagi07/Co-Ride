import React, { useEffect, useState } from "react";
import "./Notification.css";
import { useSelector } from "react-redux";
import axios from "axios";
import ChatBox from "./ChatBox";
import Conversation from "./Conversation";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const { user } = useSelector((state) => state.user);
  const userId = user.userOrAdmin._id;

  const [currentChat, setCurrentChat] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null); // Track the selected conversation
  const [showChatList, setShowChatList] = useState(false); // State to control chat list visibility

  // Fetch the list of chats
  useEffect(() => {
    const getChats = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3000/chat/${userId}`
        );
        setChats(data);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    };
    getChats();
  }, [user]);

  // Function to handle when a conversation is clicked
  const handleConversationClick = (chat, userData) => {
    setCurrentChat(chat);
    setSelectedChatId(chat._id); // Set the selected chat ID to highlight the conversation
    console.log(userData);
    if (window.innerWidth <= 776) {
      setShowChatList(false); // Hide the chat list on mobile after selecting a conversation
    }
  };

  // Function to handle window resize
  const handleResize = () => {
    if (window.innerWidth > 776) {
      setShowChatList(true); // Show chat list on larger screens
    } else {
      setShowChatList(false); // Hide chat list on smaller screens
    }
  };

  // Attach the resize event listener
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // Check initial width

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="Chat">
      {/* Show/Hide button */}
      <div className="show-chat" onClick={() => {
        if (window.innerWidth <= 776) {
          setShowChatList(!showChatList);
        }
      }}>
        {showChatList ? ' ☰ ' : ' ☰ '}
      </div>

      {/* left side - Chat list */}
      <div className="Left-side-chat" style={{ display: showChatList ? 'flex' : 'none' }}>
        <div className="Chat-container">
          <h2>Chats</h2>
          <div className="Chat-list">
            {chats.map((chat) => (
              <div
                onClick={() => {}}
                key={chat._id}
              >
                <Conversation
                  data={chat}
                  currentUserId={userId}
                  onClick={(userData) => handleConversationClick(chat, userData)}
                  selectedConversationId={selectedChatId} // Pass the selected chat ID
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right side - ChatBox */}
      <div className="Right-side-chat">
        <ChatBox
          chat={currentChat}
          currentUser={userId}
        />
      </div>
    </div>
  );
};

export default Chat;
