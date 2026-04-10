const decodeBase64Url = (value) => {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  return normalized + '='.repeat(padding);
};

export const decodeJwtPayload = (token) => {
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

export const readJsonLocalStorage = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
};

export const parseSupportConversationKey = (conversationKey) => {
  const match = /^admin:([^|]+)\|(user|driver):([^|]+)$/.exec(String(conversationKey || ''));

  if (!match) {
    return null;
  }

  return {
    adminId: match[1],
    peerRole: match[2],
    peerId: match[3],
  };
};

export const resolveChatRole = (preferredRole) => {
  const role = String(
    preferredRole ||
      localStorage.getItem('chatRole') ||
      localStorage.getItem('role') ||
      '',
  ).toLowerCase();

  if (role === 'admin' || role === 'driver' || role === 'user') {
    return role;
  }

  if (localStorage.getItem('adminToken')) {
    return 'admin';
  }

  if (localStorage.getItem('token')) {
    return 'driver';
  }

  return 'guest';
};

export const resolveChatToken = (preferredRole) => {
  const role = resolveChatRole(preferredRole);
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
  const driverToken = localStorage.getItem('driverToken') || localStorage.getItem('token');

  if (role === 'admin') {
    return adminToken;
  }

  if (role === 'driver') {
    return driverToken;
  }

  if (role === 'user') {
    return userToken;
  }

  return adminToken || userToken || driverToken || null;
};

export const getChatSession = (preferredRole) => {
  const role = resolveChatRole(preferredRole);
  const token = resolveChatToken(role);
  const payload = decodeJwtPayload(token);
  const adminInfo = readJsonLocalStorage('adminInfo');

  return {
    role,
    token,
    id: payload?.sub || payload?.id || null,
    name:
      role === 'admin'
        ? adminInfo?.name || payload?.name || 'Admin'
        : role === 'driver'
          ? payload?.name || 'Driver'
          : payload?.name || 'User',
    phone: payload?.phone || '',
    isAuthenticated: Boolean(token),
  };
};
