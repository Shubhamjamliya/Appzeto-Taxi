import { Driver } from '../models/Driver.js';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../services/tokenService.js';
import { ApiError } from '../utils/ApiError.js';

const roleModelMap = {
  driver: Driver,
  user: User,
};

export const authenticate = (allowedRoles = []) => async (req, _res, next) => {
  try {
    const authorization = req.headers.authorization || '';
    const [, token] = authorization.split(' ');

    if (!token) {
      throw new ApiError(401, 'Authorization token is required');
    }

    const payload = verifyAccessToken(token);

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      throw new ApiError(403, 'Insufficient permissions for this resource');
    }

    const Model = roleModelMap[payload.role];

    if (!Model) {
      throw new ApiError(401, 'Unsupported auth role');
    }

    const entity = await Model.findById(payload.sub);

    if (!entity) {
      throw new ApiError(401, 'Authenticated account no longer exists');
    }

    req.auth = {
      sub: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
