import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
