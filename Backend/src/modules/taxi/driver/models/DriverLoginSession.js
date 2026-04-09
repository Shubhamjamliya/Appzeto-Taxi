import mongoose from 'mongoose';

const driverLoginSessionSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

driverLoginSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DriverLoginSession =
  mongoose.models.DriverLoginSession ||
  mongoose.model('DriverLoginSession', driverLoginSessionSchema);
