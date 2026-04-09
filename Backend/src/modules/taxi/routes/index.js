import { Router } from 'express';
import { driverRouter } from './driverRoutes.js';
import { rideRouter } from './rideRoutes.js';
import { userRouter } from './userRoutes.js';

export const taxiRouter = Router();

taxiRouter.use('/users', userRouter);
taxiRouter.use('/drivers', driverRouter);
taxiRouter.use('/rides', rideRouter);
