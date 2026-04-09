import { Router } from 'express';
import { rideRouter } from './rideRoutes.js';
import { userRouter } from './userRoutes.js';

export const userModuleRouter = Router();

userModuleRouter.use('/users', userRouter);
userModuleRouter.use('/rides', rideRouter);
