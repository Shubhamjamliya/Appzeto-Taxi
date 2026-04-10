import api from '../../../shared/api/axiosInstance';

export const getSupportConversations = () => api.get('/chats/conversations');

export const getSupportMessages = (conversationKey) =>
  api.get(`/chats/messages/${encodeURIComponent(conversationKey)}`);

export const sendSupportMessage = (payload) => api.post('/chats/messages', payload);

export const markSupportMessagesRead = (conversationKey) =>
  api.patch(`/chats/messages/${encodeURIComponent(conversationKey)}/read`);
