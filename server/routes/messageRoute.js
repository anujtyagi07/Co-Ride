import express from 'express';
import { getChats, recieveMessages, sendMessage } from '../controllers/messageController.js';
import { isAuthenticated } from '../middlewares/auth.js';
export const messageRouter = express.Router();

messageRouter.post("/send", isAuthenticated, sendMessage);
messageRouter.get("/view", isAuthenticated, recieveMessages);
messageRouter.get("/chat/:id", isAuthenticated, getChats);
