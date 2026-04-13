import { Router } from 'express';
import { deliveryRouter } from './deliveryRoutes.js';
import { rideRouter } from './rideRoutes.js';
import { userRouter } from './userRoutes.js';

export const userModuleRouter = Router();

userModuleRouter.use('/users', userRouter);
userModuleRouter.use('/deliveries', deliveryRouter);
userModuleRouter.use('/rides', rideRouter);
