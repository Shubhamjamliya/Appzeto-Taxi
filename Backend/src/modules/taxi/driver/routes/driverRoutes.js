import { Router } from 'express';
import { asyncHandler } from '../../../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  completeOnboarding,
  goOffline,
  goOnline,
  getCurrentDriver,
  getOnboardingSession,
  getServiceLocations,
  loginDriver,
  saveOnboardingDocuments,
  saveOnboardingPersonal,
  saveOnboardingReferral,
  saveOnboardingVehicle,
  registerDriver,
  startOnboarding,
  verifyOnboardingOtp,
} from '../controllers/driverController.js';

export const driverRouter = Router();

driverRouter.post('/register', asyncHandler(registerDriver));
driverRouter.post('/login', asyncHandler(loginDriver));
driverRouter.get('/me', authenticate(['driver']), asyncHandler(getCurrentDriver));
driverRouter.get('/service-locations', asyncHandler(getServiceLocations));
driverRouter.post('/onboarding/send-otp', asyncHandler(startOnboarding));
driverRouter.post('/onboarding/verify-otp', asyncHandler(verifyOnboardingOtp));
driverRouter.patch('/onboarding/personal', asyncHandler(saveOnboardingPersonal));
driverRouter.patch('/onboarding/referral', asyncHandler(saveOnboardingReferral));
driverRouter.patch('/onboarding/vehicle', asyncHandler(saveOnboardingVehicle));
driverRouter.patch('/onboarding/documents', asyncHandler(saveOnboardingDocuments));
driverRouter.post('/onboarding/complete', asyncHandler(completeOnboarding));
driverRouter.get('/onboarding/session/:registrationId', asyncHandler(getOnboardingSession));
driverRouter.patch('/online', authenticate(['driver']), asyncHandler(goOnline));
driverRouter.patch('/offline', authenticate(['driver']), asyncHandler(goOffline));
