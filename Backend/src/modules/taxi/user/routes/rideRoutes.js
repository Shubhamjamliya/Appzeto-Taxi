import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import { createRide, getRideById, listAvailableDrivers } from '../controllers/rideController.js';

export const rideRouter = Router();

rideRouter.post('/', authenticate(['user']), asyncHandler(createRide));
rideRouter.get('/available-drivers', authenticate(['user', 'driver', 'admin']), asyncHandler(listAvailableDrivers));
rideRouter.get('/:rideId', authenticate(['user', 'driver']), asyncHandler(getRideById));
