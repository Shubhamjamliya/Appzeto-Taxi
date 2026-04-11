import { ApiError } from '../../../../utils/ApiError.js';
import { User } from '../models/User.js';
import { comparePassword, hashPassword, signAccessToken } from '../services/authService.js';
import { env } from '../../../../config/env.js';
import { uploadDataUrlToCloudinary } from '../../../../utils/cloudinaryUpload.js';
import {
  consumeUserSignupSession,
  requireVerifiedUserSignupSession,
  startUserOtp,
  verifyUserOtp,
} from '../services/userOtpService.js';

const VALID_GENDERS = new Set(['male', 'female', 'other', 'prefer-not-to-say', '']);

const toCleanString = (value) => String(value || '').trim();

const normalizePhone = (value) => {
  const digits = toCleanString(value).replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
};

const normalizeEmail = (value) => toCleanString(value).toLowerCase();

const normalizeGender = (value) => {
  const gender = toCleanString(value).toLowerCase();
  return VALID_GENDERS.has(gender) ? gender : 'prefer-not-to-say';
};

const validatePhone = (phone) => {
  if (!/^\d{10}$/.test(phone)) {
    throw new ApiError(400, 'A valid 10-digit phone number is required');
  }
};

const validateName = (name) => {
  if (!name || name.length < 2 || name.length > 80) {
    throw new ApiError(400, 'name must be between 2 and 80 characters');
  }
};

const validateEmail = (email) => {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, 'A valid email address is required');
  }
};

const normalizeMoneyAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'amount must be a positive number');
  }
  return Math.round(amount * 100) / 100;
};

const toUserPayload = (user) => ({
  id: user._id,
  name: user.name || '',
  phone: user.phone || '',
  email: user.email || '',
  gender: user.gender || '',
  profileImage: user.profileImage || '',
  currentRideId: user.currentRideId || null,
});

const ensureUserCanLogin = (user) => {
  if (user.deletedAt || user.isActive === false || user.active === false) {
    throw new ApiError(403, 'User account is not active');
  }
};

const createUserSession = (user) => ({
  token: signAccessToken({ sub: String(user._id), role: 'user' }),
  user: toUserPayload(user),
});

export const registerUser = async (req, res) => {
  const password = String(req.body.password || '');
  const name = toCleanString(req.body.name);
  const phone = normalizePhone(req.body.phone);
  const email = normalizeEmail(req.body.email);
  const countryCode = toCleanString(req.body.countryCode) || '+91';
  const gender = normalizeGender(req.body.gender);
  const profileImage = toCleanString(req.body.profileImage);

  validateName(name);
  validatePhone(phone);
  validateEmail(email);

  if (!password || password.length < 5) {
    throw new ApiError(400, 'password must be at least 5 characters');
  }

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  const user = await User.create({
    name,
    phone,
    countryCode,
    email,
    gender,
    profileImage,
    password: await hashPassword(password),
  });

  res.status(201).json({
    success: true,
    data: createUserSession(user),
  });
};

export const signupUser = async (req, res) => {
  const name = toCleanString(req.body.name);
  const phone = normalizePhone(req.body.phone);
  const email = normalizeEmail(req.body.email);
  const countryCode = toCleanString(req.body.countryCode) || '+91';
  const gender = normalizeGender(req.body.gender);
  const profileImage = toCleanString(req.body.profileImage);

  validateName(name);
  validatePhone(phone);
  validateEmail(email);

  const signupSession = await requireVerifiedUserSignupSession(phone);

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  const user = await User.create({
    name,
    phone,
    email,
    countryCode,
    gender,
    profileImage,
    isVerified: true,
  });
  await consumeUserSignupSession(signupSession);

  res.status(201).json({
    success: true,
    data: createUserSession(user),
  });
};

export const startUserOtpRequest = async (req, res) => {
  const result = await startUserOtp(req.body);
  res.status(201).json({ success: true, data: result });
};

export const verifyUserOtpRequest = async (req, res) => {
  const result = await verifyUserOtp(req.body);
  res.json({ success: true, data: result });
};

export const loginUser = async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || '');

  validatePhone(phone);

  if (!password) {
    throw new ApiError(400, 'password is required');
  }

  const user = await User.findOne({ phone }).select('+password');

  if (!user || !user.password || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid phone or password');
  }

  ensureUserCanLogin(user);

  res.json({
    success: true,
    data: createUserSession(user),
  });
};

export const verifyUserPhoneForOtpLogin = async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  validatePhone(phone);

  const user = await User.findOne({ phone }).lean();

  if (!user) {
    res.json({
      success: true,
      data: {
        exists: false,
        user: null,
      },
    });
    return;
  }

  ensureUserCanLogin(user);

  res.json({
    success: true,
    data: {
      exists: true,
      ...createUserSession(user),
    },
  });
};

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.auth?.sub).lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || '',
        profileImage: user.profileImage || '',
        currentRideId: user.currentRideId || null,
        createdAt: user.createdAt || null,
      },
    },
  });
};

export const uploadUserProfileImage = async (req, res) => {
  const dataUrl = String(req.body?.dataUrl || '');

  if (!dataUrl) {
    throw new ApiError(400, 'dataUrl is required');
  }

  if (dataUrl.length > 12_000_000) {
    throw new ApiError(413, 'Image is too large');
  }

  const uploadResult = await uploadDataUrlToCloudinary({
    dataUrl,
    folder: `${env.cloudinary.folder}/user-profile`,
    publicIdPrefix: 'user-profile',
  });

  res.status(201).json({
    success: true,
    data: {
      secureUrl: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
    },
  });
};

export const updateCurrentUser = async (req, res) => {
  const userId = req.auth?.sub;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'name')) {
    const name = toCleanString(req.body.name);
    validateName(name);
    user.name = name;
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'email')) {
    const email = normalizeEmail(req.body.email);
    validateEmail(email);
    user.email = email;
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'profileImage')) {
    user.profileImage = toCleanString(req.body.profileImage);
  }

  await user.save();

  res.json({
    success: true,
    data: {
      user: toUserPayload(user),
    },
  });
};

export const getUserWallet = async (req, res) => {
  const user = await User.findById(req.auth?.sub).select('walletBalance walletTransactions').slice('walletTransactions', -10).lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const transactions = Array.isArray(user.walletTransactions) ? user.walletTransactions : [];

  res.json({
    success: true,
    data: {
      balance: Number(user.walletBalance || 0),
      currency: 'INR',
      recentTransactions: transactions
        .slice()
        .reverse()
        .map((tx) => ({
          id: tx._id,
          kind: tx.kind,
          amount: Number(tx.amount || 0),
          title: tx.title || '',
          counterpartyPhone: tx.counterpartyPhone || '',
          createdAt: tx.createdAt || null,
        })),
    },
  });
};

export const topupUserWallet = async (req, res) => {
  const amount = normalizeMoneyAmount(req.body?.amount);
  const userId = req.auth?.sub;

  const tx = {
    kind: 'credit',
    amount,
    title: 'Wallet Refilled',
  };

  const updateResult = await User.updateOne(
    { _id: userId },
    {
      $inc: { walletBalance: amount },
      $push: { walletTransactions: { $each: [tx], $slice: -50 } },
    },
  );

  if (!updateResult?.modifiedCount) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await User.findById(userId).select('walletBalance walletTransactions').slice('walletTransactions', -10).lean();
  const transactions = Array.isArray(updatedUser?.walletTransactions) ? updatedUser.walletTransactions : [];

  res.status(201).json({
    success: true,
    data: {
      balance: Number(updatedUser?.walletBalance || 0),
      currency: 'INR',
      recentTransactions: transactions
        .slice()
        .reverse()
        .map((entry) => ({
          id: entry._id,
          kind: entry.kind,
          amount: Number(entry.amount || 0),
          title: entry.title || '',
          counterpartyPhone: entry.counterpartyPhone || '',
          createdAt: entry.createdAt || null,
        })),
    },
  });
};

export const transferUserWallet = async (req, res) => {
  const amount = normalizeMoneyAmount(req.body?.amount);
  const recipientPhone = normalizePhone(req.body?.phone);
  validatePhone(recipientPhone);

  const senderId = req.auth?.sub;

  const sender = await User.findById(senderId).select({ walletBalance: 1, phone: 1 }).lean();
  if (!sender) {
    throw new ApiError(404, 'User not found');
  }

  if (sender.phone === recipientPhone) {
    throw new ApiError(400, 'Cannot transfer to same phone number');
  }

  if (Number(sender.walletBalance || 0) < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  const recipient = await User.findOne({ phone: recipientPhone }).select({ _id: 1 }).lean();
  if (!recipient) {
    throw new ApiError(404, 'Recipient not found');
  }

  const debitTx = {
    kind: 'debit',
    amount,
    title: 'Wallet Transfer',
    counterpartyPhone: recipientPhone,
  };

  const creditTx = {
    kind: 'credit',
    amount,
    title: 'Wallet Received',
    counterpartyPhone: sender.phone || '',
  };

  const senderUpdate = await User.updateOne(
    { _id: senderId, walletBalance: { $gte: amount } },
    { $inc: { walletBalance: -amount }, $push: { walletTransactions: { $each: [debitTx], $slice: -50 } } },
  );

  if (!senderUpdate?.modifiedCount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  const recipientUpdate = await User.updateOne(
    { _id: recipient._id },
    { $inc: { walletBalance: amount }, $push: { walletTransactions: { $each: [creditTx], $slice: -50 } } },
  );

  if (!recipientUpdate?.modifiedCount) {
    await User.updateOne(
      { _id: senderId },
      { $inc: { walletBalance: amount }, $pull: { walletTransactions: { counterpartyPhone: recipientPhone, kind: 'debit', amount } } },
    );
    throw new ApiError(500, 'Transfer failed');
  }

  const wallet = await User.findById(senderId)
    .select('walletBalance walletTransactions')
    .slice('walletTransactions', -10)
    .lean();

  const transactions = Array.isArray(wallet?.walletTransactions) ? wallet.walletTransactions : [];

  res.status(201).json({
    success: true,
    data: {
      balance: Number(wallet?.walletBalance || 0),
      currency: 'INR',
      recentTransactions: transactions
        .slice()
        .reverse()
        .map((entry) => ({
          id: entry._id,
          kind: entry.kind,
          amount: Number(entry.amount || 0),
          title: entry.title || '',
          counterpartyPhone: entry.counterpartyPhone || '',
          createdAt: entry.createdAt || null,
        })),
    },
  });
};
