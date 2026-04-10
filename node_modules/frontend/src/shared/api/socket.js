/**
 * Mock Socket Service
 * Standardized to prevent ReferenceErrors and console noise
 * All Socket.IO functionality has been removed.
 */
// SOCKET.IO COMPLETELY REMOVED TO PREVENT ERRORS
// Real-time Push functionality is disabled as requested.

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    console.log('🔇 Socket.IO has been disabled in the frontend.');
    return null;
    // console.log('🔌 Socket connection bypassed');
    return this;
  }

  disconnect() {
    // No action needed
    // console.log('🔌 Socket disconnected');
  }

  // Generic event stub
  // Pure mock implementation - satisfy calling components
  on(event, callback) {
    // No action needed
    // Doing nothing - prevents errors in components
  }

  off(event, callback) {
    // No action needed
    // Doing nothing
  }

  emit(event, data) {
    // No action needed
    // Doing nothing
  }
}

export const socketService = new SocketService();

