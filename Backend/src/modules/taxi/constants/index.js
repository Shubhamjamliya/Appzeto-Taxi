export const RIDE_STATUS = Object.freeze({
  SEARCHING: 'searching',
  ACCEPTED: 'accepted',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const VEHICLE_TYPES = Object.freeze(['bike', 'auto', 'car']);

export const DISPATCH_RADII = Object.freeze([3000, 6000, 10000]);
export const DISPATCH_TOP_DRIVERS = 5;
export const DISPATCH_RETRY_DELAY_MS = 15000;
