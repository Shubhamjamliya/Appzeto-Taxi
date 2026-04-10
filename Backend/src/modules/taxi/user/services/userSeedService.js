import { User } from '../models/User.js';
import { hashPassword } from './authService.js';

const DEFAULT_USER = {
  name: 'Demo User',
  phone: '9998887776',
  password: '12345',
};

export const ensureDefaultUserSeeded = async () => {
  const existingUser = await User.findOne({ phone: DEFAULT_USER.phone }).lean();

  if (existingUser) {
    return existingUser;
  }

  return User.create({
    name: DEFAULT_USER.name,
    phone: DEFAULT_USER.phone,
    password: await hashPassword(DEFAULT_USER.password),
  });
};
