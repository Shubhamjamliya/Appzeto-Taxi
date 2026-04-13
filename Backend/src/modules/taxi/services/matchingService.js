import { ApiError } from '../../../utils/ApiError.js';
import { normalizePoint } from '../../../utils/geo.js';
import { DISPATCH_TOP_DRIVERS } from '../constants/index.js';
import { Driver } from '../driver/models/Driver.js';
import { Zone } from '../driver/models/Zone.js';

const buildDriverMatchFilters = ({ zoneId, vehicleTypeId }) => ({
  isOnline: true,
  isOnRide: false,
  'wallet.isBlocked': { $ne: true },
  ...(zoneId ? { zoneId } : {}),
  ...(vehicleTypeId ? { vehicleTypeId } : {}),
});

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
  const {
    maxDistance = 3000,
    limit = DISPATCH_TOP_DRIVERS,
    vehicleTypeId,
  } = options;

  const zone = await findZoneByPickup(coordinates);

  // MongoDB handles both distance filtering and nearest-first sorting via $near.
  const locationFilter = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  };

  let drivers = await Driver.find({
    ...buildDriverMatchFilters({
      zoneId: zone?._id || null,
      vehicleTypeId,
    }),
    ...locationFilter,
  })
    .limit(limit)
    .select('name phone socketId vehicleTypeId vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating location zoneId isOnline isOnRide');

  if (drivers.length === 0 && zone?._id) {
    drivers = await Driver.find({
      ...buildDriverMatchFilters({
        zoneId: null,
        vehicleTypeId,
      }),
      ...locationFilter,
    })
      .limit(limit)
      .select('name phone socketId vehicleTypeId vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating location zoneId isOnline isOnRide');
  }

  return { zone, drivers };
};
