import ErrorHandler from "../middlewares/ErrorHandler.js";
import { Messages } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import mongoose from "mongoose";
export const sendMessage = async (req, res) => {
  const { receiverId, messageContent } = req.body;
  const senderId = req.user.id;

  try {
    // Validate that both sender and receiver exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Create a new message
    const newMessage = new Messages({
      message: messageContent,
      sender: senderId,
      receiver: receiverId,
    });

    // Save the message to the database
    await newMessage.save();

    // Return a success response
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    // Handle any errors
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

export const recieveMessages = async (req, res) => {
  const receiverId = req.user.id;

  try {
    // Find all messages received by the user
    const receivedMessages = await Messages.find({
      receiver: receiverId,
    }).populate("sender", "name email").populate("receiver", "name");

    // Log the retrieved messages
    console.log("Received Messages:", receivedMessages);

    if (!receivedMessages.length) {
      return res
        .status(404)
        .json({ success: false, message: "No messages found" });
    }

    // Return the retrieved messages
    res.status(200).json({ success: true, messages: receivedMessages });
  } catch (error) {
    // Handle any errors
    console.error("Error retrieving messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      error: error.message,
    });
  }
};
export const getChats=async(req,res)=>{
  const receiverId = req.user.id;
  const senderId=req.params.id;
  const receivedMessages = await Messages.find({
    $or: [
      { receiver: receiverId, sender: senderId },
      { receiver: senderId, sender: receiverId }
    ]
  }).populate("sender", "name email");

  res.json({
    success:true,
    receivedMessages
  })
}