import mongoose from 'mongoose';
import { ApiError } from '../../../utils/ApiError.js';
import { toPoint } from '../../../utils/geo.js';
import { RIDE_STATUS } from '../constants/index.js';
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
