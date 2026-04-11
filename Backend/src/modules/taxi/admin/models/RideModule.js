import mongoose from 'mongoose';

const rideModuleSchema = new mongoose.Schema({
  transport_type: String,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const RideModule = mongoose.models.RideModule || mongoose.model('RideModule', rideModuleSchema);
