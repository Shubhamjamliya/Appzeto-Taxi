import mongoose from 'mongoose';
import { AdminAppSetting } from '../models/AdminAppSetting.js';
import { AppModule } from '../models/AppModule.js';
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

    if (Array.isArray(appDefaults.app_modules) && appDefaults.app_modules.length > 0) {
      await AppModule.deleteMany({});
      await AppModule.insertMany(
        appDefaults.app_modules.map((item) => ({
          ...(mongoose.isValidObjectId(item._id) ? { _id: item._id } : {}),
          name: item.name,
          transport_type: item.transport_type,
          service_type: item.service_type,
          order_by: Number(item.order_by || 0),
          short_description: item.short_description || '',
          description: item.description || '',
          active: item.active ?? true,
          mobile_menu_icon: item.mobile_menu_icon || '',
        }))
      );
      console.log('App modules seeded successfully.');
    }

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
