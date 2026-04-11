import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  createRide,
  getMyActiveRide,
  getRideById,
  listAvailableDrivers,
  updateRideStatus,
} from '../controllers/rideController.js';

export const rideRouter = Router();

rideRouter.post('/', authenticate(['user']), asyncHandler(createRide));
rideRouter.get('/available-drivers', asyncHandler(listAvailableDrivers));
rideRouter.get('/active/me', authenticate(['user', 'driver']), asyncHandler(getMyActiveRide));
rideRouter.get('/:rideId', authenticate(['user', 'driver']), asyncHandler(getRideById));
rideRouter.patch('/:rideId/status', authenticate(['driver']), asyncHandler(updateRideStatus));
