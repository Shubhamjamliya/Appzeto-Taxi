import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema({
  transactionId: String,
  driver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  amount: Number,
  payment_method: String,
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

export const WithdrawalRequest = mongoose.models.WithdrawalRequest || mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
