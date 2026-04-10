import mongoose from 'mongoose';

const objectId = () => new mongoose.Types.ObjectId().toString();

export const createDefaultAppSettings = () => ({
  scope: 'default',
  wallet_setting: {
    minimum_wallet_amount_for_transfer: '100',
    driver_wallet_minimum_amount_to_get_an_order: '100',
    owner_wallet_minimum_amount_to_get_an_order: '100',
    minimum_amount_added_to_wallet: '500',
    enable_joining_bonus: '1',
    joining_bonus_for_user: '50',
    joining_bonus_for_driver: '50',
    show_wallet_feature_on_mobile_app: '1',
    show_wallet_feature_for_driver: '1',
    show_wallet_feature_for_owner: '1',
    enable_wallet_transfer_user: '1',
    enable_wallet_transfer_driver: '1',
    enable_wallet_transfer_owner: '1',
  },
  tip_setting: {
    enable_tips: '1',
    min_tip_amount: '10',
  },
  country: {
    default_country_code: 'IN',
    default_country_name: 'India',
    supported_countries: ['IN', 'US', 'AE'],
  },
  app_modules: [
    {
      _id: objectId(),
      name: 'Taxi Service',
      transport_type: 'taxi',
      service_type: 'normal',
      order_by: 1,
      short_description: 'Instant city rides',
      active: true,
    },
    {
      _id: objectId(),
      name: 'Delivery',
      transport_type: 'delivery',
      service_type: 'normal',
      order_by: 2,
      short_description: 'Parcel and goods',
      active: true,
    },
  ],
  onboarding_screens: [
    {
      _id: objectId(),
      title: 'Reliable Rides',
      description: 'Book a ride in seconds and get where you need to go.',
      image: 'onboarding1.png',
      order: 1,
      audience: 'user',
    },
    {
      _id: objectId(),
      title: 'Earn More',
      description: 'Join as a driver and turn your time into money.',
      image: 'onboarding2.png',
      order: 1,
      audience: 'driver',
    },
  ],
});
