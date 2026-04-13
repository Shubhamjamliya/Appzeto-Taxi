import { ApiError } from '../../../../utils/ApiError.js';
import { verifyAccessToken } from '../../services/tokenService.js';

export const getIdentityFromSocket = (socket) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    throw new ApiError(401, 'Socket token is required');
  }

  return verifyAccessToken(token);
};

export const attachSocketAuth = (io) => {
  io.use((socket, next) => {
    try {
      socket.auth = getIdentityFromSocket(socket);
      next();
    } catch (error) {
      next(error);
    }
  });
};
