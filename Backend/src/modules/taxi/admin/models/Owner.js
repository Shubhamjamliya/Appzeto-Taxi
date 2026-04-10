import mongoose from 'mongoose';

const ownerSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    service_location_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceLocation',
      default: null,
    },
    transport_type: {
      type: String,
      default: 'taxi',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    approve: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: 'pending',
      trim: true,
    },
  },
  { timestamps: true },
);

ownerSchema.index({ company_name: 1 });
ownerSchema.index({ service_location_id: 1 });

export const Owner = mongoose.models.Owner || mongoose.model('Owner', ownerSchema);
