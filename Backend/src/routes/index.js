import { Router } from 'express';
import { driverRouter } from './driverRoutes.js';
import { rideRouter } from './rideRoutes.js';
import { userRouter } from './userRoutes.js';

export const apiRouter = Router();

apiRouter.use('/users', userRouter);
apiRouter.use('/drivers', driverRouter);
apiRouter.use('/rides', rideRouter);
