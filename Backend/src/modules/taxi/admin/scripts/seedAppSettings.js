import mongoose from 'mongoose';
import { AdminAppSetting } from '../models/AdminAppSetting.js';
import { createDefaultAppSettings } from '../data/defaultAppSettings.js';
import { AdminBusinessSetting } from '../models/AdminBusinessSetting.js';
import { createDefaultBusinessSettings } from '../data/defaultBusinessSettings.js';
import { AdminThirdPartySetting } from '../models/AdminThirdPartySetting.js';
import { createDefaultThirdPartySettings } from '../data/defaultThirdPartySettings.js';
import { connectDatabase } from '../../../../config/database.js';

const seed = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database...');

    // Seed App Settings
    const appDefaults = createDefaultAppSettings();
    await AdminAppSetting.findOneAndUpdate(
      { scope: 'default' },
      { $set: appDefaults },
      { upsert: true, new: true }
    );
    console.log('App settings seeded successfully.');

    // Seed Third Party Settings
    const thirdPartyDefaults = createDefaultThirdPartySettings();
    await AdminThirdPartySetting.findOneAndUpdate(
      { scope: 'default' },
      { $set: thirdPartyDefaults },
      { upsert: true, new: true }
    );
    console.log('Third-party integration settings seeded successfully.');

    // Refresh Business Settings
    const bizDefaults = createDefaultBusinessSettings();
    await AdminBusinessSetting.findOneAndUpdate(
      { scope: 'default' },
      { $set: bizDefaults },
      { upsert: true, new: true }
    );
    console.log('Business settings refreshed.');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed settings:', error);
    process.exit(1);
  }
};

seed();
