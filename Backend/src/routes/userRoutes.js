import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userRouter = Router();

userRouter.post('/register', asyncHandler(registerUser));
userRouter.post('/login', asyncHandler(loginUser));
