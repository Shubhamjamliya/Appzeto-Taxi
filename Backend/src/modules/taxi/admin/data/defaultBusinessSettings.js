export const createDefaultBusinessSettings = () => ({
  scope: 'default',
  general: {
    // Identity & Core Branding
    app_name: 'Appzeto',
    contact_phone_1: '0000000000',
    contact_phone_2: '0000000000',
    contact_booking_number: '9999999999',
    admin_login_url: 'admin',
    owner_login_url: 'owner-login',
    dispatcher_login_url: 'dispatch',
    user_login_url: 'user-login',
    footer_1: '2024 © Appzeto.',
    footer_2: 'Design & Develop by Appzeto',
    
    // Links
    android_user_url: 'Your Android User App Link',
    android_driver_url: 'Your Android Driver App Link',
    ios_user_url: 'Your IOS User App Link',
    ios_driver_url: 'Your IOS Driver App Link',
    
    // Core Config
    default_country_code: 'IN',
    default_lat: '22.7196',
    default_lng: '75.8577',
    default_currency_code_for_mobile_app: 'INR',
    currency_symbol: '₹',
  },
  customization: {
    // Themes
    admin_theme_color: '#405189',
    landing_theme_color: '#0ab39c',
    sidebar_text_color: '#ffffff',
    disp_sidebar_bg: '#000000',
    disp_side_text: '#000000',
    
    // Toggles (UI & Feature)
    enable_waze_navigation: '1',
    show_wallet_feature_on_mobile_app: '1',
    show_wallet_feature_for_driver: '1',
    show_wallet_feature_for_owner: '1',
    show_instant_ride_feature_on_mobile_app: '1',
    enable_wallet_transfer_user: '1',
    enable_wallet_transfer_driver: '1',
    enable_wallet_transfer_owner: '1',
    enable_outstation_round_trip: '1',
    show_incentive_feature_for_driver: '1',
    enable_driver_loyalty: '1',
    enable_country_restrict_on_map: '1',
    enable_owner_module: '1',
    show_ride_otp: '1',
    enable_delivery_otp_load: '1',
    enable_delivery_otp_unload: '1',
    show_ride_without_destination: '1',
    enable_web_booking_feature: '1',
    enable_sub_vehicle_feature: '1',
    enable_landing_site: '1',
    enable_additional_charge_feature: '1',
    enable_driver_disapprove_on_update: '1',
    enable_support_ticket_feature: '1',
    enable_map_appearance_change_on_mobile_app: '1',
    enable_driver_leaderboard_feature: '1',
    enable_multiple_ride_feature: '1',
    enable_max_dist_feature: '1',
    enable_fixed_fare: '1',
    
    // Wallet (Merged into customization as per simplified model request)
    minimum_wallet_amount_for_transfer: '100',
    driver_wallet_minimum_amount_to_get_an_order: '100',
    owner_wallet_minimum_amount_to_get_an_order: '100',
    minimum_amount_added_to_wallet: '500',
    enable_joining_bonus: '1',
    joining_bonus_for_user: '50',
    joining_bonus_for_driver: '50',
    
    // Sign-in Toggles
    user_email_login: '1',
    user_email_otp: '1',
    user_email_password: '1',
    user_mobile_login: '1',
    user_mobile_otp: '1',
    user_mobile_password: '1',
    driver_email_login: '1',
    driver_email_otp: '1',
    driver_email_password: '1',
    driver_mobile_login: '1',
    driver_mobile_otp: '1',
    driver_mobile_password: '1',
    owner_email_login: '1',
    owner_email_otp: '1',
    owner_email_password: '1',
    owner_mobile_login: '1',
    owner_mobile_otp: '1',
    owner_mobile_password: '1',
  },
  transport_ride: {
    // Dispatch & Timing
    trip_dispatch_type: '1',
    maximum_time_for_accept_reject_bidding_ride: '60',
    maximum_time_for_find_drivers_for_bitting_ride: '300',
    maximum_time_for_find_drivers_for_regular_ride: '300',
    trip_accept_reject_duration_for_driver: '15',
    
    // Radius & Distance
    driver_search_radius: '5',
    bidding_ride_maximum_distance: '50',
    user_can_make_a_ride_after_x_miniutes: '15',
    minimum_time_for_search_drivers_for_schedule_ride: '1',
    minimum_time_for_starting_trip_drivers_for_schedule_ride: '15',
    
    // Logic Toggles
    can_round_the_bill_values: '1',
    enable_shipment_load_feature: '1',
    enable_shipment_unload_feature: '1',
    enable_digital_signature: '1',
    enable_eta_price_on_complete: '1',
    
    // Chain & Route
    enable_secondary_ride: '0',
    max_dist_secondary_ride: '2',
    enable_my_route_booking_feature: '0',
    how_many_times_a_driver_can_enable_the_my_route_booking_per_day: '1',
    
    // Tip
    enable_tips: '1',
    min_tip_amount: '10',
  },
  bid_ride: {
    // Driver side
    bidding_low_percentage: '10',
    bidding_high_percentage: '20',
    bidding_amount_increase_or_decrease: '10',
    
    // User side
    user_bidding_low_percentage: '10',
    user_bidding_high_percentage: '20',
    user_bidding_amount_increase_or_decrease: '10',
  },
});
