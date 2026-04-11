import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  createRazorpayWalletTopupOrder,
  getUserWallet,
  getCurrentUser,
  loginUser,
  registerUser,
  signupUser,
  startUserOtpRequest,
  topupUserWallet,
  transferUserWallet,
  updateCurrentUser,
  uploadUserProfileImage,
  verifyRazorpayWalletTopup,
  verifyUserOtpRequest,
  verifyUserPhoneForOtpLogin,
} from '../controllers/userController.js';

export const userRouter = Router();

userRouter.post('/register', asyncHandler(registerUser));
userRouter.post('/signup', asyncHandler(signupUser));
userRouter.post('/login', asyncHandler(loginUser));
userRouter.post('/profile-image', asyncHandler(uploadUserProfileImage));
userRouter.post('/auth/send-otp', asyncHandler(startUserOtpRequest));
userRouter.post('/auth/verify-otp', asyncHandler(verifyUserOtpRequest));
userRouter.post('/otp-login', asyncHandler(verifyUserPhoneForOtpLogin));
userRouter.get('/me', authenticate(['user']), asyncHandler(getCurrentUser));
userRouter.patch('/me', authenticate(['user']), asyncHandler(updateCurrentUser));
userRouter.get('/wallet', authenticate(['user']), asyncHandler(getUserWallet));
userRouter.post('/wallet/topup', authenticate(['user']), asyncHandler(topupUserWallet));
userRouter.post('/wallet/transfer', authenticate(['user']), asyncHandler(transferUserWallet));
userRouter.post('/wallet/razorpay/order', authenticate(['user']), asyncHandler(createRazorpayWalletTopupOrder));
userRouter.post('/wallet/razorpay/verify', authenticate(['user']), asyncHandler(verifyRazorpayWalletTopup));
