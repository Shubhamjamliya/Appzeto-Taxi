import { Router } from 'express';
import {
  goOffline,
  goOnline,
  loginDriver,
  registerDriver,
} from '../controllers/driverController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const driverRouter = Router();

driverRouter.post('/register', asyncHandler(registerDriver));
driverRouter.post('/login', asyncHandler(loginDriver));
driverRouter.patch('/online', authenticate(['driver']), asyncHandler(goOnline));
driverRouter.patch('/offline', authenticate(['driver']), asyncHandler(goOffline));
