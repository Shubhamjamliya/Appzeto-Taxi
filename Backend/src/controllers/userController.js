import { User } from '../models/User.js';
import { comparePassword, hashPassword } from '../services/passwordService.js';
import { signAccessToken } from '../services/tokenService.js';
import { ApiError } from '../utils/ApiError.js';

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
