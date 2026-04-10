import { io } from 'socket.io-client';
import { BACKEND_ORIGIN } from './runtimeConfig';

const SOCKET_ORIGIN = import.meta.env.VITE_SOCKET_URL || BACKEND_ORIGIN;

const resolveTokenForRole = (role) => {
  const normalizedRole = String(role || localStorage.getItem('role') || '').toLowerCase();
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('token');

  if (normalizedRole === 'admin') {
    return adminToken;
  }

  if (normalizedRole === 'driver' || normalizedRole === 'user') {
    return userToken;
  }

  return adminToken || userToken || null;
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
