import mongoose from 'mongoose';
import { RIDE_LIVE_STATUS, RIDE_STATUS } from '../../constants/index.js';

const rideMessageSchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ['user', 'driver'],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxiUser',
      required: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxiDriver',
      default: null,
    },
    vehicleTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaxiVehicle',
      default: null,
    },
    vehicleIconType: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(RIDE_STATUS),
      default: RIDE_STATUS.SEARCHING,
    },
    liveStatus: {
      type: String,
      enum: Object.values(RIDE_LIVE_STATUS),
      default: RIDE_LIVE_STATUS.SEARCHING,
    },
    pickupLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    dropLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
    },
    promo: {
      code: {
        type: String,
        default: '',
        trim: true,
        uppercase: true,
      },
      promo_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxiPromoCode',
        default: null,
      },
      discount_amount: {
        type: Number,
        default: 0,
        min: 0,
      },
      fare_before_discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      fare_after_discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      service_location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TaxiServiceLocation',
        default: null,
      },
      transport_type: {
        type: String,
        enum: ['taxi', 'delivery', 'all'],
        default: 'taxi',
        trim: true,
      },
      applied_at: {
        type: Date,
        default: null,
      },
    },
    lastDriverLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
      heading: {
        type: Number,
        default: null,
      },
      speed: {
        type: Number,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    messages: {
      type: [rideMessageSchema],
      default: [],
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Ride = mongoose.models.TaxiRide || mongoose.model('TaxiRide', rideSchema);
