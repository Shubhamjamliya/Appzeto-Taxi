import { Router } from 'express';
import { adminModuleRouter } from '../admin/routes/index.js';
import { driverModuleRouter } from '../driver/routes/index.js';
import { userModuleRouter } from '../user/routes/index.js';

export const taxiRouter = Router();

taxiRouter.use(adminModuleRouter);
taxiRouter.use(userModuleRouter);
taxiRouter.use(driverModuleRouter);
