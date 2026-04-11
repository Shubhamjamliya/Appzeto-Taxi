import mongoose from 'mongoose';
import { ApiError } from '../../../utils/ApiError.js';
import { normalizePoint, toPoint } from '../../../utils/geo.js';
import { RIDE_LIVE_STATUS, RIDE_STATUS } from '../constants/index.js';
import { Driver } from '../driver/models/Driver.js';
import { Ride } from '../user/models/Ride.js';
import { User } from '../user/models/User.js';

export const createRideRecord = async ({ userId, pickupCoords, dropCoords, fare, vehicleTypeId, vehicleIconType }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.currentRideId) {
    throw new ApiError(409, 'User already has an active ride');
  }

  const safeFare = Number(fare);

  if (!Number.isFinite(safeFare) || safeFare < 0) {
    throw new ApiError(400, 'fare must be a positive number or zero');
  }

  if (vehicleTypeId && !mongoose.Types.ObjectId.isValid(vehicleTypeId)) {
    throw new ApiError(400, 'vehicleTypeId is invalid');
  }

  const ride = await Ride.create({
    userId,
    vehicleTypeId: vehicleTypeId || null,
    vehicleIconType: vehicleIconType || '',
    pickupLocation: toPoint(pickupCoords, 'pickup'),
    dropLocation: toPoint(dropCoords, 'drop'),
    fare: safeFare,
    status: RIDE_STATUS.SEARCHING,
    liveStatus: RIDE_LIVE_STATUS.SEARCHING,
  });

  user.currentRideId = ride._id;
  await user.save();

  return ride;
};

export const getRideDetails = async (rideId) => {
  const ride = await Ride.findById(rideId)
    .populate('userId', 'name phone')
    .populate('driverId', 'name phone vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating');

  if (!ride) {
    throw new ApiError(404, 'Ride not found');
  }

  return ride;
};

export const getRideRoom = (rideId) => `ride_${rideId}`;

const activeRideStatuses = [RIDE_STATUS.SEARCHING, RIDE_STATUS.ACCEPTED, RIDE_STATUS.ONGOING];

const populateRideRealtime = async (rideId) =>
  Ride.findById(rideId)
    .populate('userId', 'name phone')
    .populate('driverId', 'name phone vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating');

export const serializeRideRealtime = (ride) => ({
  rideId: String(ride._id),
  room: getRideRoom(ride._id),
  status: ride.status,
  liveStatus: ride.liveStatus,
  fare: ride.fare,
  pickupLocation: ride.pickupLocation,
  dropLocation: ride.dropLocation,
  acceptedAt: ride.acceptedAt,
  startedAt: ride.startedAt,
  completedAt: ride.completedAt,
  lastDriverLocation: ride.lastDriverLocation?.coordinates?.length
    ? {
        type: ride.lastDriverLocation.type,
        coordinates: ride.lastDriverLocation.coordinates,
        heading: ride.lastDriverLocation.heading,
        speed: ride.lastDriverLocation.speed,
        updatedAt: ride.lastDriverLocation.updatedAt,
      }
    : null,
  user: ride.userId,
  driver: ride.driverId,
  messages: (ride.messages || []).slice(-30).map((message) => ({
    id: String(message._id),
    senderRole: message.senderRole,
    senderId: String(message.senderId),
    message: message.message,
    sentAt: message.sentAt,
  })),
});

export const ensureRideParticipantAccess = async ({ rideId, role, entityId }) => {
  const ride = await Ride.findById(rideId).select('userId driverId status liveStatus');

  if (!ride) {
    throw new ApiError(404, 'Ride not found');
  }

  const actorId = String(entityId);
  const isUser = role === 'user' && String(ride.userId) === actorId;
  const isDriver = role === 'driver' && ride.driverId && String(ride.driverId) === actorId;

  if (!isUser && !isDriver) {
    throw new ApiError(403, 'You are not allowed to access this ride room');
  }

  return ride;
};

export const getActiveRideForIdentity = async ({ role, entityId }) => {
  if (role === 'user') {
    const user = await User.findById(entityId).select('currentRideId');

    if (!user?.currentRideId) {
      return null;
    }

    return populateRideRealtime(user.currentRideId);
  }

  if (role === 'driver') {
    return Ride.findOne({
      driverId: entityId,
      status: { $in: activeRideStatuses },
    })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name phone')
      .populate('driverId', 'name phone vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating');
  }

  return null;
};

export const acceptRideAssignment = async ({ rideId, driverId }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const ride = await Ride.findOne({
      _id: rideId,
      status: RIDE_STATUS.SEARCHING,
      driverId: null,
    }).session(session);

    if (!ride) {
      throw new ApiError(409, 'Ride is no longer available for acceptance');
    }

    const driver = await Driver.findOne({
      _id: driverId,
      isOnline: true,
      isOnRide: false,
      ...(ride.vehicleTypeId ? { vehicleTypeId: ride.vehicleTypeId } : {}),
    }).session(session);

    if (!driver) {
      throw new ApiError(409, 'Driver is unavailable to accept this ride');
    }

    ride.driverId = driver._id;
    ride.status = RIDE_STATUS.ACCEPTED;
    ride.liveStatus = RIDE_LIVE_STATUS.ACCEPTED;
    ride.acceptedAt = new Date();
    driver.isOnRide = true;

    await ride.save({ session });
    await driver.save({ session });
    await session.commitTransaction();

    return ride;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const rideStatusConfig = {
  [RIDE_LIVE_STATUS.ACCEPTED]: {
    persistedStatus: RIDE_STATUS.ACCEPTED,
    allowedCurrent: [RIDE_LIVE_STATUS.ACCEPTED, RIDE_LIVE_STATUS.ARRIVING],
  },
  [RIDE_LIVE_STATUS.ARRIVING]: {
    persistedStatus: RIDE_STATUS.ACCEPTED,
    allowedCurrent: [RIDE_LIVE_STATUS.ACCEPTED, RIDE_LIVE_STATUS.ARRIVING],
  },
  [RIDE_LIVE_STATUS.STARTED]: {
    persistedStatus: RIDE_STATUS.ONGOING,
    allowedCurrent: [RIDE_LIVE_STATUS.ACCEPTED, RIDE_LIVE_STATUS.ARRIVING, RIDE_LIVE_STATUS.STARTED],
  },
  [RIDE_LIVE_STATUS.COMPLETED]: {
    persistedStatus: RIDE_STATUS.COMPLETED,
    allowedCurrent: [RIDE_LIVE_STATUS.STARTED, RIDE_LIVE_STATUS.ARRIVING, RIDE_LIVE_STATUS.ACCEPTED],
  },
};

export const updateRideLifecycle = async ({ rideId, driverId, nextStatus }) => {
  const config = rideStatusConfig[nextStatus];

  if (!config) {
    throw new ApiError(400, 'Unsupported ride status');
  }

  const ride = await Ride.findOne({ _id: rideId, driverId });

  if (!ride) {
    throw new ApiError(404, 'Assigned ride not found');
  }

  if (!config.allowedCurrent.includes(ride.liveStatus)) {
    throw new ApiError(409, `Ride cannot move from ${ride.liveStatus} to ${nextStatus}`);
  }

  ride.liveStatus = nextStatus;
  ride.status = config.persistedStatus;

  if (nextStatus === RIDE_LIVE_STATUS.STARTED && !ride.startedAt) {
    ride.startedAt = new Date();
  }

  if (nextStatus === RIDE_LIVE_STATUS.COMPLETED) {
    ride.completedAt = new Date();
  }

  await ride.save();

  if (nextStatus === RIDE_LIVE_STATUS.COMPLETED) {
    await Promise.all([
      User.findByIdAndUpdate(ride.userId, { currentRideId: null }),
      Driver.findByIdAndUpdate(driverId, { isOnRide: false }),
    ]);
  }

  return populateRideRealtime(ride._id);
};

export const appendRideMessage = async ({ rideId, role, senderId, message }) => {
  const trimmedMessage = String(message || '').trim();

  if (!trimmedMessage) {
    throw new ApiError(400, 'Message is required');
  }

  if (!['user', 'driver'].includes(role)) {
    throw new ApiError(403, 'Only rider and driver can send ride messages');
  }

  await ensureRideParticipantAccess({ rideId, role, entityId: senderId });

  const ride = await Ride.findById(rideId);

  if (!ride) {
    throw new ApiError(404, 'Ride not found');
  }

  ride.messages.push({
    senderRole: role,
    senderId,
    message: trimmedMessage,
  });

  if (ride.messages.length > 200) {
    ride.messages = ride.messages.slice(-200);
  }

  await ride.save();

  const latestMessage = ride.messages[ride.messages.length - 1];

  return {
    id: String(latestMessage._id),
    rideId: String(ride._id),
    senderRole: latestMessage.senderRole,
    senderId: String(latestMessage.senderId),
    message: latestMessage.message,
    sentAt: latestMessage.sentAt,
  };
};

export const updateRideDriverLocation = async ({ rideId, driverId, coordinates, heading = null, speed = null }) => {
  const normalizedCoords = normalizePoint(coordinates, 'coordinates');
  const ride = await Ride.findOne({ _id: rideId, driverId });

  if (!ride) {
    throw new ApiError(404, 'Assigned ride not found');
  }

  ride.lastDriverLocation = {
    type: 'Point',
    coordinates: normalizedCoords,
    heading: Number.isFinite(Number(heading)) ? Number(heading) : null,
    speed: Number.isFinite(Number(speed)) ? Number(speed) : null,
    updatedAt: new Date(),
  };

  await ride.save();

  return {
    rideId: String(ride._id),
    coordinates: normalizedCoords,
    heading: ride.lastDriverLocation.heading,
    speed: ride.lastDriverLocation.speed,
    updatedAt: ride.lastDriverLocation.updatedAt,
  };
};
