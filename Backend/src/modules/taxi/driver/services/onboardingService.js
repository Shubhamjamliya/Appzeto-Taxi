import crypto from 'node:crypto';
import { ApiError } from '../../../../utils/ApiError.js';
import { normalizePoint, toPoint } from '../../../../utils/geo.js';
import { uploadDataUrlToCloudinary } from '../../../../utils/cloudinaryUpload.js';
import { Driver } from '../models/Driver.js';
import { DriverRegistrationSession } from '../models/DriverRegistrationSession.js';
import { hashPassword } from './authService.js';
import { findZoneByPickup } from './locationService.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const CITY_COORDINATES = {
  indore: [75.8577, 22.7196],
  bhopal: [77.4126, 23.2599],
  dewas: [76.0595, 22.9659],
  ujjain: [75.7849, 23.1765],
  'new delhi': [77.1025, 28.7041],
};

const VEHICLE_TYPE_MAP = {
  v1: 'bike',
  v2: 'car',
  v3: 'auto',
  bike: 'bike',
  cab: 'car',
  car: 'car',
  auto: 'auto',
  taxi: 'car',
};

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '').trim();

const normalizeRole = (role) => (String(role || 'driver').toLowerCase() === 'owner' ? 'owner' : 'driver');

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const getCoordinatesForCity = (city) => {
  const key = String(city || '').trim().toLowerCase();
  return CITY_COORDINATES[key] || null;
};

const getVehicleType = (vehicleTypeId, registerFor = '') => {
  const type = VEHICLE_TYPE_MAP[String(vehicleTypeId || registerFor || '').trim().toLowerCase()];
  return type || 'car';
};

const normalizeStoredDocument = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return {
      secureUrl: value,
      previewUrl: value,
      uploaded: true,
    };
  }

  return {
    ...value,
    previewUrl: value.previewUrl || value.secureUrl || '',
    uploaded: value.uploaded ?? Boolean(value.secureUrl || value.previewUrl),
  };
};

const publicSessionPayload = (session, debugOtp = null) => ({
  registrationId: session.registrationId,
  phone: session.phone,
  role: session.role,
  status: session.status,
  otpVerified: Boolean(session.otpVerifiedAt),
  documentsUploaded: Object.keys(session.documents || {}).filter((key) => Boolean(session.documents?.[key])),
  debugOtp,
});

const publicDriverPayload = (driver) => {
  if (!driver) {
    return null;
  }

  return {
    id: driver._id,
    name: driver.name,
    phone: driver.phone,
    email: driver.email,
    gender: driver.gender,
    vehicleType: driver.vehicleType,
    registerFor: driver.registerFor,
    vehicleNumber: driver.vehicleNumber,
    vehicleColor: driver.vehicleColor,
    city: driver.city,
    approve: driver.approve,
    status: driver.status,
    rating: driver.rating,
  };
};

const getSession = async (registrationId, phone = '') => {
  const query = registrationId
    ? { registrationId: String(registrationId) }
    : { phone: normalizePhone(phone) };

  const session = await DriverRegistrationSession.findOne(query).select('+otpHash');

  if (!session) {
    throw new ApiError(404, 'Registration session not found');
  }

  if (session.expiresAt && new Date(session.expiresAt).getTime() < Date.now()) {
    await DriverRegistrationSession.deleteOne({ _id: session._id });
    throw new ApiError(410, 'Registration session expired');
  }

  return session;
};

const uploadRegistrationDocument = async (documentKey, value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'object' && value.secureUrl) {
    return normalizeStoredDocument(value);
  }

  const dataUrl = typeof value === 'string' ? value : value.dataUrl;
  const originalFilename = typeof value === 'object'
    ? value.fileName || value.originalFilename || documentKey
    : documentKey;

  if (!dataUrl) {
    throw new ApiError(400, `${documentKey} must contain an image data URL`);
  }

  const safeSuffix = String(originalFilename)
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '');

  const uploaded = await uploadDataUrlToCloudinary({
    dataUrl,
    folder: `${documentKey}/driver-documents`,
    publicIdPrefix: `driver-${documentKey}`,
    publicIdSuffix: safeSuffix,
  });

  return {
    key: documentKey,
    fileName: originalFilename,
    uploaded: true,
    uploadedAt: new Date().toISOString(),
    previewUrl: uploaded.secureUrl,
    secureUrl: uploaded.secureUrl,
    publicId: uploaded.publicId,
    resourceType: uploaded.resourceType,
    format: uploaded.format,
    bytes: uploaded.bytes,
    width: uploaded.width,
    height: uploaded.height,
    cloudinary: uploaded,
  };
};

export const startDriverOnboarding = async ({ phone, role = 'driver' }) => {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone || normalizedPhone.length !== 10) {
    throw new ApiError(400, 'A valid 10-digit mobile number is required');
  }

  const normalizedRole = normalizeRole(role);
  const existingDriver = await Driver.findOne({ phone: normalizedPhone });

  if (existingDriver) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  const otp = generateOtp();
  const now = Date.now();
  const registrationId = crypto.randomUUID();

  const session = await DriverRegistrationSession.findOneAndUpdate(
    { phone: normalizedPhone },
    {
      registrationId,
      phone: normalizedPhone,
      role: normalizedRole,
      status: 'otp_sent',
      otpHash: hashOtp(otp),
      otpExpiresAt: new Date(now + OTP_TTL_MS),
      otpVerifiedAt: null,
      expiresAt: new Date(now + SESSION_TTL_MS),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const debugOtp = process.env.NODE_ENV === 'production' ? null : otp;

  return {
    message: 'OTP generated successfully',
    session: publicSessionPayload(session, debugOtp),
  };
};

export const verifyDriverOtp = async ({ registrationId, phone, otp }) => {
  const session = await getSession(registrationId, phone);

  if (!otp || String(otp).trim().length !== 6) {
    throw new ApiError(400, 'A valid 6-digit OTP is required');
  }

  if (!session.otpExpiresAt || new Date(session.otpExpiresAt).getTime() < Date.now()) {
    throw new ApiError(410, 'OTP has expired');
  }

  if (session.otpHash !== hashOtp(otp)) {
    throw new ApiError(401, 'Invalid OTP');
  }

  session.status = 'otp_verified';
  session.otpVerifiedAt = new Date();
  await session.save();

  return {
    message: 'OTP verified successfully',
    session: publicSessionPayload(session),
  };
};

export const saveDriverPersonalDetails = async ({ registrationId, phone, fullName, email, gender, password }) => {
  const session = await getSession(registrationId, phone);

  if (!session.otpVerifiedAt) {
    throw new ApiError(400, 'Verify OTP before continuing');
  }

  if (!fullName || !email || !gender || !password) {
    throw new ApiError(400, 'fullName, email, gender and password are required');
  }

  session.personal = {
    fullName: String(fullName).trim(),
    email: String(email).trim().toLowerCase(),
    gender: String(gender).trim(),
    passwordHash: await hashPassword(password),
  };
  session.status = 'personal_saved';
  await session.save();

  return {
    message: 'Personal details saved',
    personal: {
      fullName: session.personal.fullName,
      email: session.personal.email,
      gender: session.personal.gender,
    },
    session: publicSessionPayload(session),
  };
};

export const saveDriverReferral = async ({ registrationId, phone, referralCode = '' }) => {
  const session = await getSession(registrationId, phone);

  session.referralCode = String(referralCode || '').trim().toUpperCase();
  await session.save();

  return {
    message: 'Referral code saved',
    referralCode: session.referralCode,
    session: publicSessionPayload(session),
  };
};

export const saveDriverVehicle = async ({
  registrationId,
  phone,
  registerFor,
  locationId,
  locationName,
  vehicleTypeId,
  make,
  model,
  year,
  number,
  color,
  companyName,
  companyAddress,
  city,
  postalCode,
  taxNumber,
}) => {
  const session = await getSession(registrationId, phone);

  if (!session.personal?.fullName) {
    throw new ApiError(400, 'Save personal details before vehicle details');
  }

  const selectedLocation = String(locationName || city || '').trim();
  if (!selectedLocation) {
    throw new ApiError(400, 'locationName is required');
  }

  session.vehicle = {
    registerFor: String(registerFor || session.role || 'taxi').trim().toLowerCase(),
    locationId: String(locationId || '').trim(),
    locationName: selectedLocation,
    vehicleTypeId: String(vehicleTypeId || '').trim(),
    make: String(make || '').trim(),
    model: String(model || '').trim(),
    year: String(year || '').trim(),
    number: String(number || '').trim().toUpperCase(),
    color: String(color || '').trim(),
    companyName: String(companyName || '').trim(),
    companyAddress: String(companyAddress || '').trim(),
    city: String(city || selectedLocation).trim(),
    postalCode: String(postalCode || '').trim(),
    taxNumber: String(taxNumber || '').trim().toUpperCase(),
  };
  session.status = 'vehicle_saved';
  await session.save();

  return {
    message: 'Vehicle details saved',
    vehicle: session.vehicle,
    session: publicSessionPayload(session),
  };
};

export const saveDriverDocuments = async ({ registrationId, phone, documents = {} }) => {
  const session = await getSession(registrationId, phone);

  const updatedDocuments = { ...(session.documents || {}) };
  const uploadedDocumentKeys = [];

  for (const [documentKey, value] of Object.entries(documents || {})) {
    const uploadedDocument = await uploadRegistrationDocument(documentKey, value);

    if (uploadedDocument) {
      updatedDocuments[documentKey] = uploadedDocument;
      uploadedDocumentKeys.push(documentKey);
    }
  }

  session.documents = updatedDocuments;
  session.status = 'documents_saved';
  await session.save();

  return {
    message: 'Documents uploaded successfully',
    uploadedDocumentKeys,
    documents: session.documents,
    session: publicSessionPayload(session),
  };
};

export const completeDriverOnboarding = async ({ registrationId, phone }) => {
  const session = await getSession(registrationId, phone);

  if (session.finalDriverId) {
    const existingDriver = await Driver.findById(session.finalDriverId);
    return {
      message: 'Registration already completed',
      driver: publicDriverPayload(existingDriver),
      documents: session.documents,
      session: publicSessionPayload(session),
    };
  }

  if (!session.otpVerifiedAt) {
    throw new ApiError(400, 'Verify OTP before submission');
  }

  if (!session.personal?.fullName || !session.personal?.passwordHash) {
    throw new ApiError(400, 'Personal details are incomplete');
  }

  if (!session.vehicle?.locationName) {
    throw new ApiError(400, 'Vehicle details are incomplete');
  }

  const requiredDocuments = ['aadharFront', 'aadharBack', 'drivingLicense', 'vehicleRC'];
  const missingDocuments = requiredDocuments.filter((key) => !session.documents?.[key]);

  if (missingDocuments.length > 0) {
    throw new ApiError(400, `Missing required documents: ${missingDocuments.join(', ')}`);
  }

  const coordinates = getCoordinatesForCity(session.vehicle.locationName);

  if (!coordinates) {
    throw new ApiError(400, `Unsupported service location: ${session.vehicle.locationName}`);
  }

  const zone = await findZoneByPickup(coordinates);
  const vehicleType = getVehicleType(session.vehicle.vehicleTypeId, session.vehicle.registerFor);
  const driver = await Driver.create({
    name: session.personal.fullName,
    phone: session.phone,
    email: session.personal.email,
    gender: session.personal.gender,
    password: session.personal.passwordHash,
    vehicleType,
    registerFor: session.vehicle.registerFor,
    vehicleNumber: session.vehicle.number,
    vehicleColor: session.vehicle.color,
    city: session.vehicle.city || session.vehicle.locationName,
    referralCode: session.referralCode,
    approve: false,
    status: 'pending',
    zoneId: zone?._id || null,
    location: toPoint(coordinates, 'location'),
    documents: session.documents,
    onboarding: {
      registrationId: session.registrationId,
      role: session.role,
      verifiedAt: session.otpVerifiedAt,
      submittedAt: new Date(),
    },
  });

  session.finalDriverId = driver._id;
  session.status = 'completed';
  session.completedAt = new Date();
  await session.save();

  return {
    message: 'Driver registration completed successfully',
    driver: publicDriverPayload(driver),
    documents: session.documents,
    session: publicSessionPayload(session),
  };
};

export const getDriverOnboardingSession = async ({ registrationId, phone }) => {
  const session = await getSession(registrationId, phone);
  return {
    session: publicSessionPayload(session),
    personal: session.personal,
    referralCode: session.referralCode,
    vehicle: session.vehicle,
    documents: session.documents,
    completedAt: session.completedAt,
  };
};
