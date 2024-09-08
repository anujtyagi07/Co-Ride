import express from 'express'
import { isAuthenticated, isAuthenticatedAdmin } from '../middlewares/auth.js';
import { adminLogin, adminRegister, approveUser, viewSenders } from '../controllers/adminController.js';
export const adminRouter=express.Router();

adminRouter.post('/register',adminRegister);
adminRouter.post('/login',adminLogin);
adminRouter.get('/view-senders',isAuthenticatedAdmin,viewSenders);

adminRouter.post('/approve/:id',isAuthenticatedAdmin,approveUser)