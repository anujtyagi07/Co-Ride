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
      <div className="follower conversation" onClick={handleClick}>
        <div>
          <div className="online-dot"></div>
          <img src={userData?.user?.avatar?.url} className="followerImage" />
          <div className="name" style={{ fontSize: "0.8rem" }}>
            <span>
              {userData?.user.name}
            </span>
          </div>
          <span>Online</span>
        </div>
      </div>
      <hr/>
    </>
  );
};

export default Conversation;
