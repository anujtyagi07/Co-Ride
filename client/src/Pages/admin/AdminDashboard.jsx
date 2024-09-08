import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getRequests } from '../../Action Creators/AdminAction';
import SenderCard from './SenderCard';
import './AdminDashboard.css';
import Loading from '../../Loader/Loading';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, pendingUsers, isAuthenticated } = useSelector((state) => state.admin);
  const [senders, setSenders] = useState([]);

  useEffect(() => {
    // Fetch the sender data from the API
    dispatch(getRequests());
  }, [dispatch]);

  useEffect(() => {
    // Update senders state when pendingUsers changes
    if (pendingUsers) {
      setSenders(pendingUsers);
    }
    
  }, [pendingUsers]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="admin-dashboard">
      <h1>Senders</h1>
      
      <div className="admin-cards-container">
      {senders.length === 0 ? (
          <p style={{color:"white"}} >No senders available</p>
        ) : (
          senders.map(sender => (
            <SenderCard key={sender.senderId} sender={sender} />
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
