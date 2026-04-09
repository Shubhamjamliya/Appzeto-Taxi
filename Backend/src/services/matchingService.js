import { DISPATCH_TOP_DRIVERS } from '../constants/index.js';
import { Driver } from '../models/Driver.js';
import { Zone } from '../models/Zone.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizePoint } from '../utils/geo.js';

export const findZoneByPickup = async (pickupCoords) => {
  const coordinates = normalizePoint(pickupCoords, 'pickupCoords');

  // Zones are authoritative for dispatch, so every pickup must belong to one polygon.
  return Zone.findOne({
    geometry: {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
      },
    },
  });
};

export const matchDrivers = async (pickupCoords, options = {}) => {
  const coordinates = normalizePoint(pickupCoords, 'pickupCoords');
  const { maxDistance = 3000, limit = DISPATCH_TOP_DRIVERS } = options;

  const zone = await findZoneByPickup(coordinates);

  if (!zone) {
    throw new ApiError(404, 'No service zone found for pickup location');
  }

  // MongoDB handles both distance filtering and nearest-first sorting via $near.
  const drivers = await Driver.find({
    isOnline: true,
    isOnRide: false,
    zoneId: zone._id,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  })
    .limit(limit)
    .select('name phone socketId vehicleType rating location zoneId isOnline isOnRide');

  return { zone, drivers };
};
