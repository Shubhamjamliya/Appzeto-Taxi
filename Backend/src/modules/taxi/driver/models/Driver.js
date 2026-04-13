import mongoose from 'mongoose';
import { VEHICLE_TYPES } from '../../constants/index.js';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      default: '',
      trim: true,
    },
    profileImage: {
      type: String,
      default: '',
      trim: true,
    },
    gender: {
      type: String,
      default: '',
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isOnRide: {
      type: Boolean,
      default: false,
    },
    socketId: {
      type: String,
      default: null,
    },
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxiVehicle',
      default: null,
    },
    vehicleIconType: {
      type: String,
      default: 'car',
      trim: true,
    },
    vehicleMake: {
      type: String,
      default: '',
      trim: true,
    },
    vehicleModel: {
      type: String,
      default: '',
      trim: true,
    },
    registerFor: {
      type: String,
      default: 'taxi',
      trim: true,
    },
    vehicleNumber: {
      type: String,
      default: '',
      trim: true,
    },
    vehicleColor: {
      type: String,
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    referralCode: {
      type: String,
      default: '',
      trim: true,
    },
    approve: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: 'approved',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      cashLimit: {
        type: Number,
        default: 500,
        min: 0,
      },
      isBlocked: {
        type: Boolean,
        default: false,
      },
    },
    zoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxiZone',
      default: null,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
        default: [0, 0],
      },
    },
    documents: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    onboarding: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { 
    timestamps: true,
  },
);

driverSchema.index({ location: '2dsphere' });

export const Driver = mongoose.models.TaxiDriver || mongoose.model('TaxiDriver', driverSchema);
