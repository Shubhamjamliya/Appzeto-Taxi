import { Ride } from '../user/models/Ride.js';
import { User } from '../user/models/User.js';
import { Driver } from '../driver/models/Driver.js';
import { matchDrivers } from './matchingService.js';
import {
  RIDE_LIVE_STATUS,
  DISPATCH_RADII,
  DISPATCH_RETRY_DELAY_MS,
  RIDE_STATUS,
} from '../constants/index.js';
import { getRideRoom } from './rideService.js';
import { SOCKET_EVENTS } from '../socket/events.js';

const activeDispatches = new Map();
let ioInstance = null;

export const getUserRoom = (userId) => `user:${userId}`;
export const getDriverRoom = (driverId) => `driver:${driverId}`;

export const setSocketServer = (io) => {
  ioInstance = io;
};

export const joinRideRoom = (socket, rideId) => {
  socket.join(getRideRoom(rideId));
};

export const addSocketSubscriptions = (socket, { role, entityId }) => {
  if (role === 'user') {
    socket.join(getUserRoom(entityId));
    return;
  }

  if (role === 'driver') {
    socket.join(getDriverRoom(entityId));
  }
};

const emitToSocket = (socketId, event, payload) => {
  if (ioInstance && socketId) {
    ioInstance.to(socketId).emit(event, payload);
  }
};

const emitToRoom = (room, event, payload) => {
  if (ioInstance) {
    ioInstance.to(room).emit(event, payload);
  }
};

const emitToDriver = (driverId, event, payload) => {
  if (driverId) {
    emitToRoom(getDriverRoom(driverId), event, payload);
  }
};

const clearDispatchTimer = (rideId) => {
  const state = activeDispatches.get(String(rideId));

  if (state?.timer) {
    clearTimeout(state.timer);
  }
};

export const stopDispatchFlow = (rideId) => {
  clearDispatchTimer(rideId);
  activeDispatches.delete(String(rideId));
};

const closeRideAsUnmatched = async (rideId) => {
  const ride = await Ride.findOneAndUpdate(
    { _id: rideId, status: RIDE_STATUS.SEARCHING },
    { status: RIDE_STATUS.CANCELLED, liveStatus: RIDE_LIVE_STATUS.CANCELLED },
    { new: true },
  );

  if (!ride) {
    return;
  }

  await User.findByIdAndUpdate(ride.userId, { currentRideId: null });

  emitToRoom(getUserRoom(ride.userId), 'rideCancelled', {
    rideId: String(ride._id),
    room: getRideRoom(ride._id),
    reason: 'No drivers accepted the ride request',
  });

  emitToRoom(getRideRoom(ride._id), 'rideRequestClosed', {
    rideId: String(ride._id),
    reason: 'unmatched',
  });

  emitToRoom(getRideRoom(ride._id), SOCKET_EVENTS.RIDE_STATUS_UPDATED, {
    rideId: String(ride._id),
    status: ride.status,
    liveStatus: ride.liveStatus,
  });
};

export const cancelRideByAdmin = async (rideId) => {
  stopDispatchFlow(rideId);

  const ride = await Ride.findById(rideId);

  if (!ride) {
    return null;
  }

  ride.status = RIDE_STATUS.CANCELLED;
  ride.liveStatus = RIDE_LIVE_STATUS.CANCELLED;
  await ride.save();

  await Promise.all([
    User.findByIdAndUpdate(ride.userId, { currentRideId: null }),
    ride.driverId ? Driver.findByIdAndUpdate(ride.driverId, { isOnRide: false }) : Promise.resolve(),
  ]);

  emitToRoom(getUserRoom(ride.userId), 'rideCancelled', {
    rideId: String(ride._id),
    room: getRideRoom(ride._id),
    reason: 'Ride was deleted by admin',
  });

  if (ride.driverId) {
    emitToRoom(getDriverRoom(ride.driverId), 'rideRequestClosed', {
      rideId: String(ride._id),
      reason: 'deleted-by-admin',
    });
  }

  emitToRoom(getRideRoom(ride._id), 'rideRequestClosed', {
    rideId: String(ride._id),
    reason: 'deleted-by-admin',
  });

  emitToRoom(getRideRoom(ride._id), SOCKET_EVENTS.RIDE_STATUS_UPDATED, {
    rideId: String(ride._id),
    status: ride.status,
    liveStatus: ride.liveStatus,
  });

  return ride;
};

const scheduleNextAttempt = (rideId, nextRadiusIndex) => {
  const timer = setTimeout(() => {
    dispatchAttempt(rideId, nextRadiusIndex).catch((error) => {
      console.error('Dispatch retry failed', error);
    });
  }, DISPATCH_RETRY_DELAY_MS);

  const currentState = activeDispatches.get(String(rideId)) || {};
  activeDispatches.set(String(rideId), { ...currentState, timer });
};

const dispatchAttempt = async (rideId, radiusIndex = 0) => {
  const ride = await Ride.findById(rideId);

  if (!ride || ride.status !== RIDE_STATUS.SEARCHING) {
    stopDispatchFlow(rideId);
    return;
  }

  try {
    const radius = DISPATCH_RADII[radiusIndex];
    const { zone, drivers } = await matchDrivers(ride.pickupLocation.coordinates, {
      maxDistance: radius,
      vehicleTypeId: ride.vehicleTypeId,
    });

    const targetDrivers = drivers;

    activeDispatches.set(String(rideId), {
      radiusIndex,
      driverIds: targetDrivers.map((driver) => String(driver._id)),
      timer: null,
    });

    for (const driver of targetDrivers) {
      emitToDriver(driver._id, 'rideRequest', {
        rideId: String(ride._id),
        userId: String(ride.userId),
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        vehicleTypeId: ride.vehicleTypeId ? String(ride.vehicleTypeId) : null,
        vehicleIconType: ride.vehicleIconType,
        fare: ride.fare,
        radius,
        zoneId: String(zone._id),
      });
    }

    emitToRoom(getUserRoom(ride.userId), 'rideSearchUpdate', {
      rideId: String(ride._id),
      status: ride.status,
      radius,
      matchedDrivers: targetDrivers.length,
    });

    if (radiusIndex === DISPATCH_RADII.length - 1) {
      // Final attempt waits one more cycle before the ride is closed as unmatched.
      const timer = setTimeout(() => {
        closeRideAsUnmatched(rideId)
          .catch((error) => console.error('Failed to mark ride unmatched', error))
          .finally(() => stopDispatchFlow(rideId));
      }, DISPATCH_RETRY_DELAY_MS);

      activeDispatches.set(String(rideId), {
        radiusIndex,
        driverIds: targetDrivers.map((driver) => String(driver._id)),
        timer,
      });

      return;
    }

    scheduleNextAttempt(rideId, radiusIndex + 1);
  } catch (error) {
    await closeRideAsUnmatched(rideId);
    stopDispatchFlow(rideId);
    throw error;
  }
};

export const startDispatchFlow = async (ride) => {
  stopDispatchFlow(ride._id);
  await dispatchAttempt(ride._id, 0);
};

export const notifyRideAccepted = async (ride) => {
  const state = activeDispatches.get(String(ride._id));
  stopDispatchFlow(ride._id);

  // Once one driver wins the race, the rider is updated and the rest are told to stop.
  const populatedRide = await Ride.findById(ride._id).populate(
    'driverId',
    'name phone vehicleTypeId vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating',
  );

  if (!populatedRide) {
    return;
  }

  emitToRoom(getUserRoom(populatedRide.userId), 'rideAccepted', {
    rideId: String(populatedRide._id),
    room: getRideRoom(populatedRide._id),
    status: populatedRide.status,
    liveStatus: populatedRide.liveStatus,
    driver: populatedRide.driverId,
  });

  emitToRoom(getRideRoom(populatedRide._id), SOCKET_EVENTS.RIDE_STATUS_UPDATED, {
    rideId: String(populatedRide._id),
    status: populatedRide.status,
    liveStatus: populatedRide.liveStatus,
    acceptedAt: populatedRide.acceptedAt,
  });

  emitToRoom(getRideRoom(populatedRide._id), 'rideRequestClosed', {
    rideId: String(populatedRide._id),
    acceptedDriverId: String(populatedRide.driverId._id),
    notifiedDriverIds: state?.driverIds || [],
    reason: 'accepted-by-another-driver',
  });

  for (const driverId of state?.driverIds || []) {
    emitToDriver(driverId, 'rideRequestClosed', {
      rideId: String(populatedRide._id),
      acceptedDriverId: String(populatedRide.driverId._id),
      reason: 'accepted-by-another-driver',
    });
  }
};
