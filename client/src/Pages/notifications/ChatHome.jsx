import axios from 'axios';
import { useEffect, useState } from 'react';

const fetchUniqueUsers = async () => {
  try {
    const response = await axios.get('message/users/unique');
    return response.data.users;
  } catch (error) {
    console.error('Error fetching unique users:', error);
    return [];
  }
};

const ChatHome = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const uniqueUsers = await fetchUniqueUsers();
      setUsers(uniqueUsers);
    };

    getUsers();
  }, []);

  return (
    <div>
      {/* Render your user list here */
      console.log(users)}
    </div>
  );
};

export default ChatHome;
