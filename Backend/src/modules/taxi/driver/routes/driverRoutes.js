import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  goOffline,
  goOnline,
  loginDriver,
  registerDriver,
} from '../controllers/driverController.js';

export const driverRouter = Router();

driverRouter.post('/register', asyncHandler(registerDriver));
driverRouter.post('/login', asyncHandler(loginDriver));
driverRouter.patch('/online', authenticate(['driver']), asyncHandler(goOnline));
driverRouter.patch('/offline', authenticate(['driver']), asyncHandler(goOffline));
