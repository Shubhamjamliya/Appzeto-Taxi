import mongoose from 'mongoose';

const serviceLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    service_location_name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    currency_name: {
      type: String,
      default: 'Indian Rupee',
      trim: true,
    },
    currency_symbol: {
      type: String,
      default: '₹',
      trim: true,
    },
    currency_code: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      trim: true,
    },
    unit: {
      type: String,
      default: 'km',
      trim: true,
    },
    latitude: {
      type: Number,
      default: 22.7196,
    },
    longitude: {
      type: Number,
      default: 75.8577,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [75.8577, 22.7196],
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

serviceLocationSchema.index({ location: '2dsphere' });
serviceLocationSchema.index({ name: 1 });
serviceLocationSchema.index({ country: 1, status: 1 });

export const ServiceLocation =
  mongoose.models.TaxiServiceLocation || mongoose.model('TaxiServiceLocation', serviceLocationSchema);
