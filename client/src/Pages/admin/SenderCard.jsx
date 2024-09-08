import React, { useState } from 'react';
import axios from 'axios';
import './SenderCard.css';
import toast from 'react-hot-toast';

function SenderCard({ sender }) {
    const [approved,setIsApproved]=useState(false);
    // const {}
  const handleApproval = (isApproved) => {
    const url = `http://localhost:3000/admin/${isApproved ? 'approve' : 'reject'}/${sender.senderId}`;
    axios.post(url)
      .then(response => {
        console.log(response.data);
        setIsApproved(true);
        toast.success(`${sender.name} Approved Successfully!`)
        // Optionally, you can update the state here to remove or update the sender card
      })
      .catch(error => {
        console.error('Error updating sender:', error);
      });

  };

 
  return (
    <div className="card">
        <img src={sender.avatar.url} alt="" />
      <h2>{sender.name}</h2>
      <p>Email: {sender.email}</p>
      <p>Send Date: {new Date(sender.sendDate).toLocaleDateString()}</p>
      <p>Send Time: {sender.sendTime}</p>
      {approved?<div>Approved</div>:<div className="buttons">
        <button onClick={() => handleApproval(true)}>Approve</button>
        <button onClick={() => handleApproval(false)}>Reject</button>
      </div>}
    </div>
  );
}

export default SenderCard;