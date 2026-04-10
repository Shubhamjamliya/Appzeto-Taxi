import { ApiError } from '../../../../utils/ApiError.js';
import { User } from '../models/User.js';
import { comparePassword, hashPassword, signAccessToken } from '../services/authService.js';

export const registerUser = async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    throw new ApiError(400, 'name, phone and password are required');
  }

  const existingUser = await User.findOne({ phone });

  if (existingUser) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  const user = await User.create({
    name,
    phone,
    password: await hashPassword(password),
  });

  const token = signAccessToken({ sub: String(user._id), role: 'user' });

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    },
  });
};

export const loginUser = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(400, 'phone and password are required');
  }

  const user = await User.findOne({ phone }).select('+password');

  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, 'Invalid phone or password');
  }

  const token = signAccessToken({ sub: String(user._id), role: 'user' });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        currentRideId: user.currentRideId,
      },
    },
  });
};

export const verifyUserPhoneForOtpLogin = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new ApiError(400, 'phone is required');
  }

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

  const token = signAccessToken({ sub: String(user._id), role: 'user' });

  res.json({
    success: true,
    data: {
      exists: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        currentRideId: user.currentRideId || null,
      },
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
        currentRideId: user.currentRideId || null,
        createdAt: user.createdAt || null,
      },
    },
  });
};
