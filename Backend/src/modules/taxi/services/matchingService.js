import { ApiError } from '../../../utils/ApiError.js';
import { normalizePoint } from '../../../utils/geo.js';
import { DISPATCH_TOP_DRIVERS } from '../constants/index.js';
import { Driver } from '../driver/models/Driver.js';
import { Zone } from '../driver/models/Zone.js';

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
  const { maxDistance = 3000, limit = DISPATCH_TOP_DRIVERS, vehicleTypeId } = options;

  const zone = await findZoneByPickup(coordinates);

  if (!zone) {
    throw new ApiError(404, 'No service zone found for pickup location');
  }

  // MongoDB handles both distance filtering and nearest-first sorting via $near.
  const drivers = await Driver.find({
    isOnline: true,
    isOnRide: false,
    zoneId: zone._id,
    ...(vehicleTypeId ? { vehicleTypeId } : {}),
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
    .select('name phone socketId vehicleTypeId vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating location zoneId isOnline isOnRide');

  return { zone, drivers };
};
