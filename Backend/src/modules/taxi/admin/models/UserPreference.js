import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema({
  name: String,
  icon: String,
  active: { type: Number, default: 1 }
}, { timestamps: true });

export const UserPreference = mongoose.models.UserPreference || mongoose.model('UserPreference', userPreferenceSchema);
