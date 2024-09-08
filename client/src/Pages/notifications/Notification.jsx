import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Notification.css";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import { IoSend } from "react-icons/io5";

Modal.setAppElement("#root");

const Notification = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessageContent, setNewMessageContent] = useState("");

  const { isNotifications } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get("/user/me");
        setCurrentUser(data.user);

        const response = await axios.get("/message/view");
        const filteredMessages = response.data.messages.filter(
          (message) =>
            message.sender &&
            message.receiver &&
            message.sender._id &&
            message.receiver._id &&
            message.sender._id !== message.receiver._id
        );
        setMessages(filteredMessages);
        toast.success("All messages received");
      } catch (error) {
        toast.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = (receiver) => {
    setSelectedReceiver(receiver);
    setModalIsOpen(true);
  };

  const handleNewMessage = async (e) => {
    e.preventDefault();
    if (newMessageContent.trim() === "") return;

    try {
      const response = await axios.post("/message/send", {
        receiverId: selectedReceiver._id,
        messageContent: newMessageContent,
      });
      setMessages((prevMessages) => [...prevMessages, response.data.message]);
      setNewMessageContent("");
      toast.success("Message sent!");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const customModalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    content: {
      maxWidth: "500px",
      margin: "auto",
      padding: "20px",
      borderRadius: "10px",
      backgroundColor: "#ffffff",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
  };

  return (
    <div className="notification-container">
      <div className="chat-container">
        <div className="user-list">
          <h2>Senders</h2>
          <ul>
            {messages
              .filter(
                (msg, index, self) =>
                  msg.sender &&
                  msg.sender._id &&
                  index ===
                    self.findIndex(
                      (t) => t.sender && t.sender._id === msg.sender._id
                    )
              )
              .map((message) => (
                <li
                  key={message.sender._id}
                  onClick={() => handleSendMessage(message.sender)}
                  className="user-item"
                >
                  {message.sender.name}
                </li>
              ))}
          </ul>
        </div>
        <div className="chat-info">
          {selectedReceiver ? (
            <>
              <h2>
                <span>Chat with </span>
                <span>{selectedReceiver.name}</span>
              </h2>
              <div className="chat-messages">
                {messages
                  .filter(
                    (msg) =>
                      msg.sender &&
                      msg.receiver &&
                      msg.sender._id &&
                      msg.receiver._id &&
                      ((msg.sender._id === currentUser._id &&
                        msg.receiver._id === selectedReceiver._id) ||
                      (msg.sender._id === selectedReceiver._id &&
                        msg.receiver._id === currentUser._id))
                  )
                  .map((msg) => (
                    <div
                      key={msg._id}
                      className={`chat-message ${
                        msg.sender._id === currentUser._id ? "sent" : "received"
                      }`}
                    >
                      <div className="chat-message-body">
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <form className="send-message-form" onSubmit={handleNewMessage}>
                <input
                  type="text"
                  placeholder="Type a message"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                />
                <button type="submit">
                  <IoSend />
                </button>
              </form>
            </>
          ) : (
            currentUser && (
              <p className="p">
                <span>Welcome 👋 {currentUser.name}</span>
                <span>Select a chat to start</span>
                <span>Messaging</span>
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
