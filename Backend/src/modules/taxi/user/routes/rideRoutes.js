import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate, authenticateOrResolveUser } from '../../middlewares/authMiddleware.js';
import {
  createRide,
  getMyActiveRide,
  getRideById,
  listMyRides,
  listAvailableDrivers,
  updateRideStatus,
} from '../controllers/rideController.js';

export const rideRouter = Router();

rideRouter.post('/', authenticateOrResolveUser(['user']), asyncHandler(createRide));
rideRouter.get('/', authenticateOrResolveUser(['user']), asyncHandler(listMyRides));
rideRouter.get('/available-drivers', asyncHandler(listAvailableDrivers));
rideRouter.get('/active/me', authenticateOrResolveUser(['user', 'driver']), asyncHandler(getMyActiveRide));
rideRouter.get('/:rideId', authenticateOrResolveUser(['user', 'driver']), asyncHandler(getRideById));
rideRouter.patch('/:rideId/status', authenticate(['driver']), asyncHandler(updateRideStatus));
