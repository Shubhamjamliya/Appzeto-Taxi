import { getAdminModuleInfo } from '../services/adminService.js';

export const getAdminStatus = (_req, res) => {
  res.json({
    success: true,
    data: getAdminModuleInfo(),
  });
};
