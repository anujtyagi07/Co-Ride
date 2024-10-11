import React, { useEffect, useState } from "react";
import "./Notification.css";
import { useSelector } from "react-redux";
import axios from "axios";
import ChatBox from "./ChatBox";
import Conversation from "./Conversation";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const { user } = useSelector((state) => state.user);
  const userId=user.userOrAdmin._id;
  
  const [currentChat, setCurrentChat] = useState(null);

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
    // Log the first name and last name of the clicked user
    console.log(userData);
  };

  return (
    <div className="Chat">
      {/* left side */}
      <div className="Left-side-chat">
        <div className="Chat-container">
          <h2>Chats</h2>
          <div className="Chat-list">
            {chats.map((chat) => (
              <div
                style={{ backgroundColor: "red" }}
                onClick={() => {}}
                key={chat._id}
              >
                <Conversation
                  data={chat}
                  currentUserId={userId}
                  onClick={(userData) =>
                    handleConversationClick(chat, userData)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* right side */}
      <div className="Right-side-chat">
        {/* chat body */}
        <ChatBox
          chat={currentChat}
          currentUser={userId}
        />
      </div>
    </div>
  );
};

export default Chat;
