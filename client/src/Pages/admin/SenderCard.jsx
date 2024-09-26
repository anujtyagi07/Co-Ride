import React, { useState } from 'react';
import axios from 'axios';
import './SenderCard.css';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa'; // Spinner icon from react-icons

function SenderCard({ sender }) {
  const [approved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false); // New loading state

  const handleApproval = (isApproved) => {
    setLoading(true); // Start loading
    const url = `http://localhost:3000/admin/${isApproved ? 'approve' : 'reject'}/${sender.senderId}`;
    
    axios.post(url)
      .then(response => {
        console.log(response.data);
        setIsApproved(true);
        toast.success(`${sender.name} Approved Successfully!`);
      })
      .catch(error => {
        console.error('Error updating sender:', error);
        toast.error('Error updating sender');
      })
      .finally(() => {
        setLoading(false); // Stop loading once the request completes
      });
  };

  return (
    <div className="card">
      <img src={sender.avatar.url} alt="" />
      <h2>{sender.name}</h2>
      <p>Email: {sender.email}</p>
      <p>Send Date: {new Date(sender.sendDate).toLocaleDateString()}</p>
      <p>Send Time: {sender.sendTime}</p>
      
      {approved ? (
        <div>Approved</div>
      ) : (
        <div className="buttons">
          <button 
            onClick={() => handleApproval(true)} 
            disabled={loading} // Disable button when loading
          >
            {loading ? <FaSpinner className="spinner" /> : 'Approve'}
          </button>
          <button 
            onClick={() => handleApproval(false)} 
            disabled={loading} // Disable reject button when loading
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default SenderCard;
