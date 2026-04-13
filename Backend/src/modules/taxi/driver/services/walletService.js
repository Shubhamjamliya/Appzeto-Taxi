import mongoose from 'mongoose';
import { env } from '../../../../config/env.js';
import { ApiError } from '../../../../utils/ApiError.js';
import { Driver } from '../models/Driver.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { Ride } from '../../user/models/Ride.js';

const normalizeAmount = (value, fieldName = 'amount') => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    throw new ApiError(400, `${fieldName} must be a valid number`);
  }

  return Math.round(amount * 100) / 100;
};

const normalizePaymentMethod = (value) => (
  String(value || '').trim().toLowerCase() === 'cash' ? 'cash' : 'online'
);

const getWalletSnapshot = (driver) => ({
  balance: Number(driver?.wallet?.balance || 0),
  cashLimit: Number(driver?.wallet?.cashLimit ?? env.driverWallet.defaultCashLimit),
  isBlocked: Boolean(driver?.wallet?.isBlocked),
});

export const serializeDriverWallet = (driver) => {
  const wallet = getWalletSnapshot(driver);

  return {
    balance: wallet.balance,
    cashLimit: wallet.cashLimit,
    isBlocked: wallet.isBlocked || wallet.balance < -wallet.cashLimit,
  };
};

export const ensureDriverWalletCanAcceptRide = async (driverOrId, { session } = {}) => {
  const driver =
    typeof driverOrId === 'object' && driverOrId?._id
      ? driverOrId
      : await Driver.findById(driverOrId).session(session);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  const wallet = getWalletSnapshot(driver);
  const isBlocked = wallet.isBlocked || wallet.balance < -wallet.cashLimit;

  if (isBlocked) {
    await Driver.findByIdAndUpdate(driver._id, { 'wallet.isBlocked': true });
    throw new ApiError(403, 'Driver wallet limit exceeded. Please top up to accept rides.');
  }

  return wallet;
};

export const applyDriverWalletAdjustment = async ({
  driverId,
  amount,
  type,
  rideId = null,
  description = '',
  metadata = {},
  session = null,
}) => {
  const normalizedAmount = normalizeAmount(amount);

  if (!normalizedAmount) {
    throw new ApiError(400, 'Wallet adjustment amount cannot be zero');
  }

  const driver = await Driver.findById(driverId).session(session);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  const before = getWalletSnapshot(driver);
  const balanceAfter = Math.round((before.balance + normalizedAmount) * 100) / 100;
  const isBlockedAfter = balanceAfter < -before.cashLimit;

  const updatedDriver = await Driver.findByIdAndUpdate(
    driverId,
    {
      $inc: { 'wallet.balance': normalizedAmount },
      $set: {
        'wallet.cashLimit': before.cashLimit,
        'wallet.isBlocked': isBlockedAfter,
      },
    },
    { new: true, session },
  );

  const [transaction] = await WalletTransaction.create(
    [
      {
        driverId,
        rideId,
        type,
        amount: normalizedAmount,
        balanceBefore: before.balance,
        balanceAfter,
        cashLimit: before.cashLimit,
        isBlockedAfter,
        description,
        metadata,
      },
    ],
    { session },
  );

  return {
    driver: updatedDriver,
    wallet: serializeDriverWallet(updatedDriver),
    transaction,
  };
};

export const topUpDriverWallet = async ({ driverId, amount, metadata = {} }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const result = await applyDriverWalletAdjustment({
      driverId,
      amount: Math.abs(normalizeAmount(amount)),
      type: 'top_up',
      description: 'Driver wallet top-up',
      metadata,
      session,
    });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const settleCompletedRideWallet = async ({ rideId }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const ride = await Ride.findOneAndUpdate(
      { _id: rideId, walletSettledAt: null, driverId: { $ne: null } },
      { $set: { walletSettledAt: new Date() } },
      { new: true, session },
    );

    if (!ride) {
      await session.commitTransaction();
      return null;
    }

    const fare = normalizeAmount(ride.fare || 0, 'fare');
    const commissionAmount = Math.round(fare * env.driverWallet.commissionPercent) / 100;
    const paymentMethod = normalizePaymentMethod(ride.paymentMethod);
    const driverEarnings = Math.max(Math.round((fare - commissionAmount) * 100) / 100, 0);
    const amount = paymentMethod === 'cash' ? -commissionAmount : driverEarnings;
    const type = paymentMethod === 'cash' ? 'commission_deduction' : 'ride_earning';

    ride.paymentMethod = paymentMethod;
    ride.commissionAmount = commissionAmount;
    ride.driverEarnings = driverEarnings;
    await ride.save({ session });

    if (!amount) {
      await session.commitTransaction();
      return null;
    }

    const result = await applyDriverWalletAdjustment({
      driverId: ride.driverId,
      rideId: ride._id,
      amount,
      type,
      description: paymentMethod === 'cash'
        ? 'Commission deducted for cash ride'
        : 'Driver earning credited for online ride',
      metadata: {
        fare,
        commissionAmount,
        driverEarnings,
        paymentMethod,
        commissionPercent: env.driverWallet.commissionPercent,
      },
      session,
    });

    await session.commitTransaction();
    return {
      ...result,
      ride,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
