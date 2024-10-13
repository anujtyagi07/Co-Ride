// src/Components/SendMessage.js
import React from "react";
import axios from "axios";
import "./SendMessage.css";
import { useNavigate } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { FaRegMessage } from "react-icons/fa6";
const SendMessage = ({ userInfo }) => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const senderId = user.userOrAdmin._id;
  const receiverId = userInfo.id;
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`/chat`, { senderId, receiverId });
      const chatId = data._id;
      navigate('/notifications');
      
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

  return (
    <div className="send-message-container">
      <div className="h2">
        <span>Send a </span>
        <span>Message</span>
      </div>
      <div className="form">
        <form onSubmit={handleSubmit} className="send-msg-form">
          <button type="submit">
            <FaRegMessage />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMessage;
