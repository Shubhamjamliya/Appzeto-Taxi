import { Server } from 'socket.io';
import { env } from '../../../config/env.js';
import { normalizePoint, toPoint } from '../../../utils/geo.js';
import { Driver } from '../models/Driver.js';
import {
  addSocketSubscriptions,
  joinRideRoom,
  notifyRideAccepted,
  setSocketServer,
  startDispatchFlow,
} from '../services/dispatchService.js';
import { findZoneByPickup } from '../services/matchingService.js';
import { acceptRideAssignment, createRideRecord } from '../services/rideService.js';
import { verifyAccessToken } from '../services/tokenService.js';

const getIdentityFromSocket = (socket) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return null;
  }

  try {
    return verifyAccessToken(token);
  } catch (_error) {
    return null;
  }
};

const onAsync = (socket, handler) => async (payload = {}) => {
  try {
    await handler(payload);
  } catch (error) {
    socket.emit('errorMessage', {
      message: error.message || 'Socket operation failed',
    });
  }
};

export const configureTaxiSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(','),
      credentials: true,
    },
  });

  setSocketServer(io);

  io.on('connection', async (socket) => {
    const identity = getIdentityFromSocket(socket);

    if (!identity) {
      socket.emit('errorMessage', { message: 'Unauthorized socket connection' });
      socket.disconnect();
      return;
    }

    addSocketSubscriptions(socket, { role: identity.role, entityId: identity.sub });

    if (identity.role === 'driver') {
      await Driver.findByIdAndUpdate(identity.sub, { socketId: socket.id });
    }

    socket.on('joinRide', ({ rideId }) => {
      if (rideId) {
        joinRideRoom(socket, rideId);
      }
    });

    socket.on(
      'locationUpdate',
      onAsync(socket, async ({ coordinates }) => {
        if (identity.role !== 'driver') {
          return;
        }

        // Drivers push fresh GPS coordinates every few seconds so matching stays accurate.
        const normalizedCoords = normalizePoint(coordinates, 'coordinates');
        const zone = await findZoneByPickup(normalizedCoords);

        await Driver.findByIdAndUpdate(identity.sub, {
          socketId: socket.id,
          location: toPoint(normalizedCoords, 'coordinates'),
          zoneId: zone?._id || null,
        });
      }),
    );

    socket.on(
      'requestRide',
      onAsync(socket, async ({ pickup, drop, fare }) => {
        if (identity.role !== 'user') {
          return;
        }

        // Ride creation and dispatch share the same service path as the REST controller.
        const ride = await createRideRecord({
          userId: identity.sub,
          pickupCoords: normalizePoint(pickup, 'pickup'),
          dropCoords: normalizePoint(drop, 'drop'),
          fare: Number(fare || 0),
        });

        joinRideRoom(socket, ride._id);
        await startDispatchFlow(ride);

        socket.emit('rideCreated', {
          rideId: String(ride._id),
          status: ride.status,
        });
      }),
    );

    socket.on(
      'acceptRide',
      onAsync(socket, async ({ rideId }) => {
        if (identity.role !== 'driver' || !rideId) {
          return;
        }

        // First successful transaction wins; later accepts are rejected by the service layer.
        const ride = await acceptRideAssignment({ rideId, driverId: identity.sub });
        joinRideRoom(socket, ride._id);
        await notifyRideAccepted(ride);
      }),
    );

    socket.on('rejectRide', ({ rideId }) => {
      if (identity.role !== 'driver' || !rideId) {
        return;
      }

      socket.to(`ride:${rideId}`).emit('driverRejectedRide', {
        rideId,
        driverId: identity.sub,
      });
    });

    socket.on('disconnect', async () => {
      if (identity.role === 'driver') {
        await Driver.findByIdAndUpdate(identity.sub, { socketId: null });
      }
    });
  });

  return io;
};
