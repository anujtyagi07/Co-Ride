import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  time: {
    type: String,
    default: new Date().toLocaleTimeString(),
  },
  message: {
    type: String, // Changed from array to string for a single message
    required: true,
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true, // Added required
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true, // Added required
  },
  read: {
    type: Boolean,
    default: false,
  },
});

export const Messages = new mongoose.model("Messages", messageSchema);
