import mongoose from 'mongoose';

const { Mixed } = mongoose.Schema.Types;

const adminPanelStateSchema = new mongoose.Schema(
  {
    scope: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    dashboard: { type: Mixed, default: {} },
    admins: { type: [Mixed], default: [] },
    users: { type: [Mixed], default: [] },
    deletedUsers: { type: [Mixed], default: [] },
    drivers: { type: [Mixed], default: [] },
    owners: { type: [Mixed], default: [] },
    withdrawals: { type: [Mixed], default: [] },
    serviceLocations: { type: [Mixed], default: [] },
    rideModules: { type: [Mixed], default: [] },
    vehicleTypes: { type: [Mixed], default: [] },
    zones: { type: [Mixed], default: [] },
    subscriptionPlans: { type: [Mixed], default: [] },
    languages: { type: [Mixed], default: [] },
    preferences: { type: [Mixed], default: [] },
    roles: { type: [Mixed], default: [] },
    appModules: { type: [Mixed], default: [] },
    notificationChannels: { type: [Mixed], default: [] },
    paymentGateways: { type: [Mixed], default: [] },
    paymentSettings: { type: [Mixed], default: [] },
    smsSettings: { type: [Mixed], default: [] },
    firebaseSettings: { type: Mixed, default: {} },
    mapSettings: { type: Mixed, default: {} },
    mailSettings: { type: Mixed, default: {} },
    onboardingScreens: { type: [Mixed], default: [] },
  },
  { timestamps: true },
);

export const AdminPanelState =
  mongoose.models.AdminPanelState || mongoose.model('AdminPanelState', adminPanelStateSchema);
