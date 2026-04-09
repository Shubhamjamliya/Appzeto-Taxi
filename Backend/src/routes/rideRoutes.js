import { Router } from 'express';
import { createRide, getRideById } from '../controllers/rideController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const rideRouter = Router();

rideRouter.post('/', authenticate(['user']), asyncHandler(createRide));
rideRouter.get('/:rideId', authenticate(['user', 'driver']), asyncHandler(getRideById));
