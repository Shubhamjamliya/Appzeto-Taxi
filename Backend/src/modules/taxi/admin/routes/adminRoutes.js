import { Router } from 'express';
import { getAdminStatus } from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/', getAdminStatus);
adminRouter.get('/status', getAdminStatus);
