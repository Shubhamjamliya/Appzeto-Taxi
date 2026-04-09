import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { loginUser, registerUser } from '../controllers/userController.js';

export const userRouter = Router();

userRouter.post('/register', asyncHandler(registerUser));
userRouter.post('/login', asyncHandler(loginUser));
