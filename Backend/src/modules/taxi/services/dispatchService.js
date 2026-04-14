import { Ride } from '../user/models/Ride.js';
import { User } from '../user/models/User.js';
import { Driver } from '../driver/models/Driver.js';
import { matchDrivers } from './matchingService.js';
import {
  RIDE_LIVE_STATUS,
  DISPATCH_RADII,
  DISPATCH_INTERCITY_RADII,
  DISPATCH_RETRY_DELAY_MS,
  RIDE_STATUS,
} from '../constants/index.js';
import { Delivery } from '../user/models/Delivery.js';
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

const getDispatchVehicleTypeIds = (ride) => {
  const ids = [
    ...(Array.isArray(ride.dispatchVehicleTypeIds) ? ride.dispatchVehicleTypeIds : []),
    ride.vehicleTypeId,
  ];

  return [...new Set(ids.map((id) => String(id || '').trim()).filter(Boolean))];
};

const getDispatchRadii = (ride) => (
  String(ride?.serviceType || '').toLowerCase() === 'intercity'
    ? DISPATCH_INTERCITY_RADII
    : DISPATCH_RADII
);

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

export const notifyUserAccountDeleted = (userId) => {
  if (!userId) return;
  emitToRoom(getUserRoom(userId), 'account:deleted', {
    reason: 'delete_request_approved',
  });
};

export const emitToDriver = (driverId, event, payload) => {
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
  const dispatchState = activeDispatches.get(String(rideId));
  const ride = await Ride.findOneAndUpdate(
    { _id: rideId, status: RIDE_STATUS.SEARCHING },
    { status: RIDE_STATUS.CANCELLED, liveStatus: RIDE_LIVE_STATUS.CANCELLED },
    { new: true },
  );

  if (!ride) {
    return;
  }

  if (ride.deliveryId) {
    await Delivery.findByIdAndUpdate(ride.deliveryId, {
      status: ride.status,
      liveStatus: ride.liveStatus,
    });
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

  for (const driverId of dispatchState?.driverIds || []) {
    emitToDriver(driverId, 'rideRequestClosed', {
      rideId: String(ride._id),
      reason: 'unmatched',
    });
  }

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

  if (ride.deliveryId) {
    await Delivery.findByIdAndUpdate(ride.deliveryId, {
      driverId: ride.driverId || null,
      status: ride.status,
      liveStatus: ride.liveStatus,
    });
  }

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

export const cancelRideByUser = async ({ rideId, userId }) => {
  const dispatchState = activeDispatches.get(String(rideId));
  stopDispatchFlow(rideId);

  const ride = await Ride.findOne({ _id: rideId, userId });

  if (!ride) {
    return null;
  }

  if (ride.status === RIDE_STATUS.COMPLETED || ride.liveStatus === RIDE_LIVE_STATUS.COMPLETED) {
    throw new Error('Completed rides cannot be cancelled');
  }

  if (ride.status === RIDE_STATUS.CANCELLED || ride.liveStatus === RIDE_LIVE_STATUS.CANCELLED) {
    return ride;
  }

  ride.status = RIDE_STATUS.CANCELLED;
  ride.liveStatus = RIDE_LIVE_STATUS.CANCELLED;
  await ride.save();

  if (ride.deliveryId) {
    await Delivery.findByIdAndUpdate(ride.deliveryId, {
      driverId: ride.driverId || null,
      status: ride.status,
      liveStatus: ride.liveStatus,
    });
  }

  await Promise.all([
    User.findByIdAndUpdate(ride.userId, { currentRideId: null }),
    ride.driverId ? Driver.findByIdAndUpdate(ride.driverId, { isOnRide: false }) : Promise.resolve(),
  ]);

  emitToRoom(getUserRoom(ride.userId), 'rideCancelled', {
    rideId: String(ride._id),
    room: getRideRoom(ride._id),
    reason: 'You cancelled the ride',
  });

  if (ride.driverId) {
    emitToRoom(getDriverRoom(ride.driverId), 'rideRequestClosed', {
      rideId: String(ride._id),
      reason: 'user-cancelled',
      message: 'User cancelled the ride.',
    });
  }

  for (const driverId of dispatchState?.driverIds || []) {
    emitToDriver(driverId, 'rideRequestClosed', {
      rideId: String(ride._id),
      reason: 'user-cancelled',
      message: 'User cancelled the ride.',
    });
  }

  emitToRoom(getRideRoom(ride._id), 'rideCancelled', {
    rideId: String(ride._id),
    room: getRideRoom(ride._id),
    reason: 'User cancelled the ride',
  });

  emitToRoom(getRideRoom(ride._id), 'rideRequestClosed', {
    rideId: String(ride._id),
    reason: 'user-cancelled',
    message: 'User cancelled the ride.',
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
    const dispatchRadii = getDispatchRadii(ride);
    const radius = dispatchRadii[radiusIndex] || dispatchRadii[dispatchRadii.length - 1];
    const dispatchVehicleTypeIds = getDispatchVehicleTypeIds(ride);
    const { zone, drivers } = await matchDrivers(ride.pickupLocation.coordinates, {
      maxDistance: radius,
      vehicleTypeId: ride.vehicleTypeId,
      vehicleTypeIds: dispatchVehicleTypeIds,
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
        type: ride.serviceType || 'ride',
        serviceType: ride.serviceType || 'ride',
        userId: String(ride.userId),
        pickupLocation: ride.pickupLocation,
        pickupAddress: ride.pickupAddress || '',
        dropLocation: ride.dropLocation,
        dropAddress: ride.dropAddress || '',
        estimatedDistanceMeters: ride.estimatedDistanceMeters || 0,
        estimatedDurationMinutes: ride.estimatedDurationMinutes || 0,
        vehicleTypeId: ride.vehicleTypeId ? String(ride.vehicleTypeId) : null,
        vehicleTypeIds: dispatchVehicleTypeIds,
        vehicleIconType: ride.vehicleIconType,
        fare: ride.fare,
        paymentMethod: ride.paymentMethod,
        parcel: ride.parcel || null,
        intercity: ride.intercity || null,
        radius,
        zoneId: zone?._id ? String(zone._id) : null,
      });
    }

    emitToRoom(getUserRoom(ride.userId), 'rideSearchUpdate', {
      rideId: String(ride._id),
      status: ride.status,
      radius,
      matchedDrivers: targetDrivers.length,
    });

    if (radiusIndex === dispatchRadii.length - 1) {
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
    'name phone profileImage vehicleTypeId vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel vehicleImage rating',
  );

  if (!populatedRide) {
    return;
  }

  emitToRoom(getUserRoom(populatedRide.userId), 'rideAccepted', {
    rideId: String(populatedRide._id),
    room: getRideRoom(populatedRide._id),
    type: populatedRide.serviceType || 'ride',
    serviceType: populatedRide.serviceType || 'ride',
    status: populatedRide.status,
    liveStatus: populatedRide.liveStatus,
    driver: populatedRide.driverId,
    parcel: populatedRide.parcel || null,
  });

  emitToRoom(getUserRoom(populatedRide.userId), SOCKET_EVENTS.RIDE_STATE, {
    rideId: String(populatedRide._id),
    room: getRideRoom(populatedRide._id),
    type: populatedRide.serviceType || 'ride',
    serviceType: populatedRide.serviceType || 'ride',
    status: populatedRide.status,
    liveStatus: populatedRide.liveStatus,
    fare: populatedRide.fare,
    estimatedDistanceMeters: populatedRide.estimatedDistanceMeters || 0,
    estimatedDurationMinutes: populatedRide.estimatedDurationMinutes || 0,
    paymentMethod: populatedRide.paymentMethod,
    parcel: populatedRide.parcel || null,
    intercity: populatedRide.intercity || null,
    commissionAmount: populatedRide.commissionAmount,
    driverEarnings: populatedRide.driverEarnings,
    pickupLocation: populatedRide.pickupLocation,
    pickupAddress: populatedRide.pickupAddress || '',
    dropLocation: populatedRide.dropLocation,
    dropAddress: populatedRide.dropAddress || '',
    acceptedAt: populatedRide.acceptedAt,
    startedAt: populatedRide.startedAt,
    completedAt: populatedRide.completedAt,
    lastDriverLocation: populatedRide.lastDriverLocation?.coordinates?.length
      ? {
          type: populatedRide.lastDriverLocation.type,
          coordinates: populatedRide.lastDriverLocation.coordinates,
          heading: populatedRide.lastDriverLocation.heading,
          speed: populatedRide.lastDriverLocation.speed,
          updatedAt: populatedRide.lastDriverLocation.updatedAt,
        }
      : null,
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
