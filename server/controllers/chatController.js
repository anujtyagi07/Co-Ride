
import { Message } from '../models/messageModel';
import { User } from '../models/userModel';

export const sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // Get from auth middleware

    try {
        const message = new Message({ sender: senderId, receiver: receiverId, content });
        await message.save();
        res.status(200).json({ message: 'Message sent', message });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

export const getMessages = async (req, res) => {
    const userId = req.user.id;

    try {
        const messages = await Message.find({
            $or: [{ sender: userId }, { receiver: userId }]
        }).populate('sender receiver', 'name');

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};


