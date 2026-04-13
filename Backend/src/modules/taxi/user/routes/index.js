import { Router } from 'express';
import { promoRouter } from './promoRoutes.js';
import { rideRouter } from './rideRoutes.js';
import { userRouter } from './userRoutes.js';

export const userModuleRouter = Router();

userModuleRouter.use('/users', userRouter);
userModuleRouter.use('/rides', rideRouter);
userModuleRouter.use('/promos', promoRouter);
