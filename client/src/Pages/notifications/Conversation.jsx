import React, { useEffect, useState } from "react";
import axios from "axios";

import "./Conversation.css";

const Conversation = ({ data, currentUserId, onClick }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = data.members.find((id) => id !== currentUserId);
        const { data: user } = await axios.get(`http://localhost:3000/user/${userId}`);
        setUserData(user);
        
        
      } catch (error) {
        console.log(error);
      }
    };
    fetchUserData();
  }, [data, currentUserId]);

  const handleClick = () => {
    if (userData) {
      onClick(userData);  // Pass the user data to the parent
    }
  };

  return (
    <>
      <div className="follower_conversation" onClick={handleClick}>
        <div className="follower_conversation-in">
          <div><img src={userData?.user?.avatar?.url} className="followerImage123" style={{backgroundColor:"transparent"}}/></div>
          <div className="name">
              {userData?.user.name}
          </div>
        </div>
      </div>
    </>
  );
};

export default Conversation;
