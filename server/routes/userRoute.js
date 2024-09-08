import express from 'express'
import { getUserDetails, login, logout, register } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { generateText } from '../controllers/geminiController.js';
export const userRouter=express.Router();

userRouter.post('/register',register)
userRouter.post('/login',login)
userRouter.get('/logout',isAuthenticated,logout)
userRouter.get('/me',isAuthenticated,getUserDetails)

// userRouter.post('/verify-otp',verifyOtpAndRegister)