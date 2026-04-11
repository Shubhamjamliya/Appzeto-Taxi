import { io } from 'socket.io-client';
import { BACKEND_ORIGIN } from './runtimeConfig';

const SOCKET_ORIGIN = import.meta.env.VITE_SOCKET_URL || BACKEND_ORIGIN;

const decodeBase64Url = (value) => {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  return normalized + '='.repeat(padding);
};

const getTokenPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(atob(decodeBase64Url(payload)));
  } catch (_error) {
    return null;
  }
};

const getStoredTokenByRole = (role) => {
  const entries = [
    localStorage.getItem(`${role}Token`),
    localStorage.getItem('token'),
  ].filter(Boolean);

  return entries.find((token) => getTokenPayload(token)?.role === role) || null;
};

const resolveTokenForRole = (role) => {
  const normalizedRole = String(role || '').toLowerCase();
  const adminToken = getStoredTokenByRole('admin') || localStorage.getItem('adminToken');
  const userToken = getStoredTokenByRole('user');
  const driverToken = getStoredTokenByRole('driver');

  if (normalizedRole === 'admin') {
    return adminToken;
  }

  if (normalizedRole === 'driver') {
    return driverToken;
  }

  if (normalizedRole === 'user') {
    return userToken;
  }

  return userToken || driverToken || adminToken || null;
};

class SocketService {
  constructor() {
    this.socket = null;
    this.currentToken = null;
  }

  connect(options = {}) {
    const token = options.token || resolveTokenForRole(options.role);

    if (!token) {
      return null;
    }

    if (this.socket && this.currentToken === token) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;
    this.socket = io(SOCKET_ORIGIN, {
      auth: { token },
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentToken = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
        return;
      }

      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }
}

export const socketService = new SocketService();
