import mongoose from 'mongoose';

const appModuleSchema = new mongoose.Schema({
  name: String,
  transport_type: String,
  service_type: { type: String, default: 'normal' },
  order_by: { type: Number, default: 0 },
  short_description: String,
  description: String,
  active: { type: Boolean, default: true },
  mobile_menu_icon: String
}, { timestamps: true });

export const AppModule = mongoose.models.AppModule || mongoose.model('AppModule', appModuleSchema);
