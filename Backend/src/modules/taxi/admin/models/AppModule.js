import mongoose from 'mongoose';

const appModuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    transport_type: {
      type: String,
      default: 'taxi',
      trim: true,
    },
    service_type: {
      type: String,
      default: 'normal',
      trim: true,
    },
    order_by: {
      type: Number,
      default: 0,
    },
    short_description: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    mobile_menu_icon: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'appmodules',
  },
);

appModuleSchema.index({ order_by: 1, createdAt: -1 });
appModuleSchema.index({ active: 1, transport_type: 1 });

export const AppModule =
  mongoose.models.AppModule || mongoose.model('AppModule', appModuleSchema);
