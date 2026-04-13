import mongoose from 'mongoose';
import { ApiError } from '../../../utils/ApiError.js';
import { normalizePoint, toPoint } from '../../../utils/geo.js';
import { RIDE_LIVE_STATUS, RIDE_STATUS } from '../constants/index.js';
import { Driver } from '../driver/models/Driver.js';
import { ensureDriverWalletCanAcceptRide, settleCompletedRideWallet } from '../driver/services/walletService.js';
import { Delivery } from '../user/models/Delivery.js';
import { Ride } from '../user/models/Ride.js';
import { User } from '../user/models/User.js';

const clearUserActiveRideIfPresent = async (user) => {
  if (!user?.currentRideId) {
    return;
  }

  const activeRide = await Ride.findById(user.currentRideId);

  if (!activeRide) {
    user.currentRideId = null;
    await user.save();
    return;
  }

  if ([RIDE_STATUS.COMPLETED, RIDE_STATUS.CANCELLED].includes(activeRide.status)) {
    user.currentRideId = null;
    await user.save();
    return;
  }

  activeRide.status = RIDE_STATUS.CANCELLED;
  activeRide.liveStatus = RIDE_LIVE_STATUS.CANCELLED;
  await activeRide.save();
  await syncDeliveryWithRide(activeRide);

  await Promise.all([
    activeRide.driverId ? Driver.findByIdAndUpdate(activeRide.driverId, { isOnRide: false }) : Promise.resolve(),
    User.findByIdAndUpdate(activeRide.userId, { currentRideId: null }),
  ]);

  user.currentRideId = null;
};

export const clearDriverActiveRideIfStale = async (driverOrId) => {
  const driver =
    typeof driverOrId === 'object' && driverOrId?._id
      ? driverOrId
      : await Driver.findById(driverOrId);

  if (!driver?.isOnRide) {
    return driver;
  }

  const activeRide = await Ride.findOne({
    driverId: driver._id,
    status: { $in: activeRideStatuses },
  }).select('_id status liveStatus');

  if (activeRide) {
    return driver;
  }

  driver.isOnRide = false;
  await driver.save();

  return driver;
};

const normalizeRidePaymentMethod = (paymentMethod) => (
  !paymentMethod || String(paymentMethod).trim().toLowerCase() === 'cash' ? 'cash' : 'online'
);

const normalizeServiceType = (serviceType) => (
  String(serviceType || 'ride').trim().toLowerCase() === 'parcel' ? 'parcel' : 'ride'
);

const normalizeParcelPayload = (parcel = {}) => ({
  category: String(parcel.category || '').trim(),
  weight: String(parcel.weight || '').trim(),
  description: String(parcel.description || '').trim(),
  senderName: String(parcel.senderName || '').trim(),
  senderMobile: String(parcel.senderMobile || '').trim(),
  receiverName: String(parcel.receiverName || '').trim(),
  receiverMobile: String(parcel.receiverMobile || '').trim(),
});

const syncDeliveryWithRide = async (ride) => {
  if (!ride || (ride.serviceType || 'ride') !== 'parcel') {
    return null;
  }

  const payload = {
    rideId: ride._id,
    userId: ride.userId,
    driverId: ride.driverId || null,
    vehicleTypeId: ride.vehicleTypeId || null,
    vehicleIconType: ride.vehicleIconType || '',
    status: ride.status,
    liveStatus: ride.liveStatus,
    pickupLocation: ride.pickupLocation,
    dropLocation: ride.dropLocation,
    fare: ride.fare,
    paymentMethod: ride.paymentMethod,
    parcel: normalizeParcelPayload(ride.parcel),
    acceptedAt: ride.acceptedAt || null,
    startedAt: ride.startedAt || null,
    completedAt: ride.completedAt || null,
  };

  if (ride.deliveryId) {
    return Delivery.findByIdAndUpdate(ride.deliveryId, payload, { new: true });
  }

  const delivery = await Delivery.create(payload);
  ride.deliveryId = delivery._id;
  await ride.save();
  return delivery;
};

export const createRideRecord = async ({
  userId,
  pickupCoords,
  dropCoords,
  fare,
  vehicleTypeId,
  vehicleIconType,
  paymentMethod,
  serviceType,
  parcel,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await clearUserActiveRideIfPresent(user);

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
    serviceType: normalizeServiceType(serviceType),
    pickupLocation: toPoint(pickupCoords, 'pickup'),
    dropLocation: toPoint(dropCoords, 'drop'),
    fare: safeFare,
    paymentMethod: normalizeRidePaymentMethod(paymentMethod),
    parcel: normalizeParcelPayload(parcel),
    status: RIDE_STATUS.SEARCHING,
    liveStatus: RIDE_LIVE_STATUS.SEARCHING,
  });

  user.currentRideId = ride._id;
  await user.save();
  await syncDeliveryWithRide(ride);

  return ride;
};

export const getRideDetails = async (rideId) => {
  const ride = await Ride.findById(rideId)
    .populate('deliveryId')
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
    .populate('deliveryId')
    .populate('userId', 'name phone')
    .populate('driverId', 'name phone vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating');

export const serializeRideRealtime = (ride) => ({
  rideId: String(ride._id),
  room: getRideRoom(ride._id),
  deliveryId: ride.deliveryId?._id ? String(ride.deliveryId._id) : ride.deliveryId ? String(ride.deliveryId) : null,
  type: ride.serviceType || 'ride',
  serviceType: ride.serviceType || 'ride',
  status: ride.status,
  liveStatus: ride.liveStatus,
  fare: ride.fare,
  paymentMethod: ride.paymentMethod,
  parcel: ride.deliveryId?.parcel || ride.parcel || null,
  commissionAmount: ride.commissionAmount,
  driverEarnings: ride.driverEarnings,
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

export const listRideHistoryForIdentity = async ({ role, entityId, limit = 50 }) => {
  if (role !== 'user') {
    throw new ApiError(403, 'Only riders can access ride history');
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const rides = await Ride.find({ userId: entityId })
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .populate('deliveryId')
    .populate('driverId', 'name phone vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating')
    .lean();

  return rides.map((ride) => ({
    rideId: String(ride._id),
    deliveryId: ride.deliveryId?._id ? String(ride.deliveryId._id) : ride.deliveryId ? String(ride.deliveryId) : null,
    type: ride.serviceType || 'ride',
    serviceType: ride.serviceType || 'ride',
    status: ride.status,
    liveStatus: ride.liveStatus,
    fare: ride.fare,
    paymentMethod: ride.paymentMethod,
    parcel: ride.deliveryId?.parcel || ride.parcel || null,
    commissionAmount: ride.commissionAmount,
    driverEarnings: ride.driverEarnings,
    vehicleIconType: ride.vehicleIconType,
    pickupLocation: ride.pickupLocation,
    dropLocation: ride.dropLocation,
    acceptedAt: ride.acceptedAt,
    startedAt: ride.startedAt,
    completedAt: ride.completedAt,
    createdAt: ride.createdAt,
    updatedAt: ride.updatedAt,
    driver: ride.driverId || null,
  }));
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
      'wallet.isBlocked': { $ne: true },
      ...(ride.vehicleTypeId ? { vehicleTypeId: ride.vehicleTypeId } : {}),
    }).session(session);

    if (!driver) {
      throw new ApiError(409, 'Driver is unavailable to accept this ride');
    }

    await ensureDriverWalletCanAcceptRide(driver, { session });

    ride.driverId = driver._id;
    ride.status = RIDE_STATUS.ACCEPTED;
    ride.liveStatus = RIDE_LIVE_STATUS.ACCEPTED;
    ride.acceptedAt = new Date();
    driver.isOnRide = true;

    await ride.save({ session });
    await driver.save({ session });
    await session.commitTransaction();
    await syncDeliveryWithRide(ride);

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
  await syncDeliveryWithRide(ride);

  let walletUpdate = null;

  if (nextStatus === RIDE_LIVE_STATUS.COMPLETED) {
    await Promise.all([
      User.findByIdAndUpdate(ride.userId, { currentRideId: null }),
      Driver.findByIdAndUpdate(driverId, { isOnRide: false }),
    ]);

    walletUpdate = await settleCompletedRideWallet({ rideId: ride._id });
  }

  const populatedRide = await populateRideRealtime(ride._id);
  populatedRide.$locals.walletUpdate = walletUpdate;

  return populatedRide;
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
