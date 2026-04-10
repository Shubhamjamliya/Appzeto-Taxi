import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { getCurrentUser, loginUser, registerUser, verifyUserPhoneForOtpLogin } from '../controllers/userController.js';

export const userRouter = Router();

userRouter.post('/register', asyncHandler(registerUser));
userRouter.post('/login', asyncHandler(loginUser));
userRouter.post('/otp-login', asyncHandler(verifyUserPhoneForOtpLogin));
userRouter.get('/me', authenticate(['user']), asyncHandler(getCurrentUser));
