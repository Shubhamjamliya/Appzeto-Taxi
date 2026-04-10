import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  CircleUser,
  Clock3,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { socketService } from '../../../shared/api/socket';
import { getSupportConversations, getSupportMessages, markSupportMessagesRead, sendSupportMessage } from '../chat/chatApi';
import { getChatSession, parseSupportConversationKey } from '../chat/chatIdentity';

const quickReplies = ['Payment issue', 'Ride delayed', 'Lost item', 'Safety concern'];

const formatTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch (_error) {
    return 'Just now';
  }
};

const normalizeMessage = (message) => ({
  ...message,
  sender: {
    role: message?.sender?.role || 'user',
    id: message?.sender?.id || '',
    name: message?.sender?.name || '',
    phone: message?.sender?.phone || '',
  },
  receiver: {
    role: message?.receiver?.role || 'admin',
    id: message?.receiver?.id || '',
    name: message?.receiver?.name || '',
    phone: message?.receiver?.phone || '',
  },
});

const normalizeConversation = (conversation) => ({
  conversationKey: conversation.conversationKey,
  peer: conversation.peer || {
    role: 'admin',
    id: '',
    name: 'Support Team',
    phone: '',
  },
  latestMessage: conversation.latestMessage ? normalizeMessage(conversation.latestMessage) : null,
  unreadCount: conversation.unreadCount || 0,
  updatedAt: conversation.updatedAt || conversation.latestMessage?.createdAt || null,
});

const SupportChatPanel = ({
  mode = 'participant',
  title = 'Support Chat',
  subtitle = 'Live messages with admin',
  preferredRole,
  className = '',
}) => {
  const session = useMemo(
    () => getChatSession(preferredRole || (mode === 'admin' ? 'admin' : undefined)),
    [mode, preferredRole],
  );
  const isAdminPanel = mode === 'admin';
  const isLiveEnabled = session.isAuthenticated;

  useEffect(() => {
    if (!session.role || session.role === 'guest') {
      return undefined;
    }

    localStorage.setItem('chatRole', session.role);

    return () => {
      if (localStorage.getItem('chatRole') === session.role) {
        localStorage.removeItem('chatRole');
      }
    };
  }, [session.role]);

  const [conversations, setConversations] = useState([]);
  const [selectedConversationKey, setSelectedConversationKey] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.conversationKey === selectedConversationKey) || null,
    [conversations, selectedConversationKey],
  );

  const isMessageForActiveConversation = (message, conversationKey = selectedConversationKey) => {
    const parsedConversation = parseSupportConversationKey(conversationKey);

    if (!parsedConversation || !message?.sender || !message?.receiver) {
      return false;
    }

    const sessionId = session.id ? String(session.id) : '';
    const senderId = String(message.sender.id || '');
    const receiverId = String(message.receiver.id || '');

    if (!sessionId || !senderId || !receiverId) {
      return message.conversationKey === conversationKey || message.conversationKey === parsedConversation.canonicalKey;
    }

    if (session.role === 'admin') {
      return (
        message.sender.role === 'admin' &&
        senderId === sessionId &&
        message.receiver.role === parsedConversation.peerRole &&
        receiverId === String(parsedConversation.peerId)
      ) || (
        message.sender.role === parsedConversation.peerRole &&
        senderId === String(parsedConversation.peerId) &&
        message.receiver.role === 'admin' &&
        receiverId === sessionId
      );
    }

    return (
      message.sender.role === session.role &&
      senderId === sessionId &&
      message.receiver.role === 'admin' &&
      receiverId === String(parsedConversation.adminId)
    ) || (
      message.sender.role === 'admin' &&
      senderId === String(parsedConversation.adminId) &&
      message.receiver.role === session.role &&
      receiverId === sessionId
    );
  };

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const peerName = conversation.peer?.name || '';
      const peerPhone = conversation.peer?.phone || '';
      const latestText = conversation.latestMessage?.message || '';
      return [peerName, peerPhone, latestText].some((value) => value.toLowerCase().includes(query));
    });
  }, [conversations, search]);

  const syncConversationList = (message) => {
    setConversations((current) => {
      const index = current.findIndex((item) => item.conversationKey === message.conversationKey);
      const latestMessage = normalizeMessage(message);
      const parsedConversation = parseSupportConversationKey(message.conversationKey);
      const adminSide =
        latestMessage.sender.role === 'admin'
          ? {
              role: 'admin',
              id: latestMessage.sender.id,
              name: latestMessage.sender.name,
              phone: latestMessage.sender.phone,
            }
          : {
              role: 'admin',
              id: latestMessage.receiver.id,
              name: latestMessage.receiver.name,
              phone: latestMessage.receiver.phone,
            };

      const peer =
        session.role === 'admin'
          ? {
              role: parsedConversation?.peerRole || (latestMessage.sender.role === 'admin' ? latestMessage.receiver.role : latestMessage.sender.role),
              id: parsedConversation?.peerId || (latestMessage.sender.role === 'admin' ? latestMessage.receiver.id : latestMessage.sender.id),
              name: latestMessage.sender.role === 'admin' ? latestMessage.receiver.name : latestMessage.sender.name,
              phone: latestMessage.sender.role === 'admin' ? latestMessage.receiver.phone : latestMessage.sender.phone,
            }
          : {
              ...adminSide,
              name: adminSide.name || 'Support Team',
              phone: adminSide.phone || '',
            };

      const unreadCount =
        message.receiver.role === session.role &&
        message.sender.role !== session.role &&
        selectedConversationKey !== message.conversationKey
          ? (current[index]?.unreadCount || 0) + 1
          : 0;

      const nextConversation = {
        conversationKey: message.conversationKey,
        peer,
        latestMessage,
        unreadCount,
        updatedAt: message.createdAt,
      };

      if (index === -1) {
        return [nextConversation, ...current];
      }

      const next = [...current];
      next[index] = {
        ...next[index],
        ...nextConversation,
        unreadCount,
      };
      return next;
    });
  };

  useEffect(() => {
    if (!isLiveEnabled) {
      return undefined;
    }

    socketService.connect({ role: session.role, token: session.token });

    const handleMessage = (incomingMessage) => {
      const message = normalizeMessage(incomingMessage);
      syncConversationList(message);

      if (isMessageForActiveConversation(message)) {
        setMessages((current) => {
          if (current.some((item) => item.id === message.id)) {
            return current;
          }

          return [...current, message];
        });

        if (message.sender.role !== session.role) {
          socketService.emit('chat:read', { conversationKey: message.conversationKey });
        }
      }
    };

    const handleConversationUpdate = ({ message }) => {
      if (!message) {
        return;
      }

      syncConversationList(normalizeMessage(message));
    };

    const handleSocketError = (payload) => {
      setError(payload?.message || 'Socket connection error');
    };

    socketService.on('chat:message', handleMessage);
    socketService.on('chat:conversation-updated', handleConversationUpdate);
    socketService.on('errorMessage', handleSocketError);

    return () => {
      socketService.off('chat:message', handleMessage);
      socketService.off('chat:conversation-updated', handleConversationUpdate);
      socketService.off('errorMessage', handleSocketError);
    };
  }, [isLiveEnabled, session.role, selectedConversationKey]);

  useEffect(() => {
    if (!isLiveEnabled) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadConversations = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await getSupportConversations(session.token);
        const nextConversations = (response?.data?.conversations || []).map(normalizeConversation);

        if (!active) {
          return;
        }

        setConversations((current) => {
          const merged = new Map(current.map((item) => [item.conversationKey, item]));

          for (const conversation of nextConversations) {
            const existing = merged.get(conversation.conversationKey) || {};
            merged.set(conversation.conversationKey, {
              ...existing,
              ...conversation,
            });
          }

          return Array.from(merged.values()).sort(
            (left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0),
          );
        });

        if (!selectedConversationKey && nextConversations.length > 0) {
          setSelectedConversationKey(nextConversations[0].conversationKey);
        }
      } catch (chatError) {
        if (!active) {
          return;
        }

        setError(chatError?.message || 'Unable to load conversations');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      active = false;
    };
  }, [isLiveEnabled]);

  useEffect(() => {
    if (!isLiveEnabled || !selectedConversationKey) {
      return undefined;
    }

    let active = true;

    const loadMessages = async () => {
      setMessages([]);
      setLoading(true);
      setError('');

      try {
        const response = await getSupportMessages(selectedConversationKey, session.token);
        const nextMessages = (response?.data?.messages || [])
          .map(normalizeMessage)
          .filter((message) => isMessageForActiveConversation(message, selectedConversationKey));

        if (!active) {
          return;
        }

        setMessages(
          nextMessages.sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0)),
        );
        socketService.emit('chat:join', { conversationKey: selectedConversationKey });
        socketService.emit('chat:read', { conversationKey: selectedConversationKey });
        await markSupportMessagesRead(selectedConversationKey, session.token);
      } catch (chatError) {
        if (!active) {
          return;
        }

        setError(chatError?.message || 'Unable to load messages');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      active = false;
    };
  }, [isLiveEnabled, selectedConversationKey]);

  useEffect(() => {
    const parsedConversation = parseSupportConversationKey(selectedConversationKey);

    if (parsedConversation && parsedConversation.canonicalKey !== selectedConversationKey) {
      setSelectedConversationKey(parsedConversation.canonicalKey);
    }
  }, [selectedConversationKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversationKey) => {
    const parsedConversation = parseSupportConversationKey(conversationKey);
    setSelectedConversationKey(parsedConversation?.canonicalKey || conversationKey);
  };

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !selectedConversationKey) {
      return;
    }

    setSending(true);
    setError('');
    const parsedConversation = parseSupportConversationKey(selectedConversationKey);

    const payload = isAdminPanel
      ? {
          message: text,
          receiverRole: parsedConversation?.peerRole || selectedConversation?.peer?.role || 'user',
          receiverId: parsedConversation?.peerId || selectedConversation?.peer?.id,
          conversationKey: selectedConversationKey,
        }
      : {
          message: text,
          conversationKey: selectedConversationKey,
        };

    try {
      if (socketService.isConnected()) {
        socketService.emit('chat:send', payload);
      } else {
        const response = await sendSupportMessage(payload, session.token);
        const savedMessage = normalizeMessage(response?.data?.message);

        if (savedMessage?.id) {
          setMessages((current) => [...current, savedMessage]);
          syncConversationList(savedMessage);
        }
      }

      setDraft('');
    } catch (chatError) {
      setError(chatError?.message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  if (!isLiveEnabled) {
    return (
      <div className={`rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm ${className}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Support Chat</p>
            <h2 className="text-[20px] font-black text-slate-900">{title}</h2>
          </div>
        </div>
        <p className="mt-4 text-[13px] font-semibold leading-6 text-slate-500">
          Live chat will activate once the current session has a valid token.
        </p>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <MessageCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Support Desk</p>
            <h2 className="text-[18px] font-black text-slate-900">{title}</h2>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-emerald-700">
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em]">Live</span>
        </div>
      </div>

      <div className={`grid min-h-[calc(100vh-220px)] ${isAdminPanel ? 'xl:grid-cols-[320px_1fr]' : 'grid-cols-1'}`}>
        {isAdminPanel && (
          <aside className="border-r border-slate-100 bg-slate-50/70">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <Search size={16} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search conversations"
                  className="w-full bg-transparent text-[13px] font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-300px)] space-y-2 overflow-auto p-3">
              {visibleConversations.map((conversation) => (
                <button
                  key={conversation.conversationKey}
                  onClick={() => handleSelectConversation(conversation.conversationKey)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
                    selectedConversationKey === conversation.conversationKey
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-transparent bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    selectedConversationKey === conversation.conversationKey ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {conversation.peer?.role === 'driver' ? <CircleUser size={18} /> : <UserRound size={18} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-[13px] font-black uppercase tracking-[0.08em] ${
                        selectedConversationKey === conversation.conversationKey ? 'text-white' : 'text-slate-900'
                      }`}>
                        {conversation.peer?.name || 'Support Contact'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-[11px] font-bold uppercase tracking-[0.12em] ${
                      selectedConversationKey === conversation.conversationKey ? 'text-white/70' : 'text-slate-500'
                    }`}>
                      {conversation.peer?.role || 'user'}
                    </p>
                    <p className={`mt-1 truncate text-[12px] font-medium ${
                      selectedConversationKey === conversation.conversationKey ? 'text-white/75' : 'text-slate-500'
                    }`}>
                      {conversation.latestMessage?.message || 'No messages yet'}
                    </p>
                  </div>
                </button>
              ))}

              {!loading && visibleConversations.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center">
                  <p className="text-[12px] font-bold text-slate-500">No active conversations yet.</p>
                </div>
              )}
            </div>
          </aside>
        )}

        <main className="flex min-h-0 flex-col bg-[linear-gradient(180deg,#fbfcff_0%,#f6f8fc_100%)]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                {selectedConversation?.peer?.role === 'driver' ? <CircleUser size={20} /> : <Bot size={20} />}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-black uppercase tracking-[0.08em] text-slate-900">
                  {selectedConversation?.peer?.name || 'Support Team'}
                </h3>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  {isAdminPanel
                    ? selectedConversation?.peer?.role === 'driver'
                      ? 'Driver Support Thread'
                      : 'User Support Thread'
                    : session.role === 'driver'
                      ? 'Driver Support Thread'
                      : 'User Support Thread'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (selectedConversationKey) {
                  socketService.emit('chat:read', { conversationKey: selectedConversationKey });
                }
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 transition-colors hover:bg-slate-50"
            >
              <RefreshCcw size={14} className="inline-block" />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-5 py-5">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                  <span className="text-[12px] font-bold text-slate-500">Loading messages...</span>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-4">
                {messages.map((message) => {
                  const isMine =
                    message.sender.id && session.id
                      ? String(message.sender.id) === String(session.id)
                      : message.sender.role === session.role;

                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[78%] items-end gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-100">
                          {isMine ? <CircleUser size={15} /> : <Bot size={15} />}
                        </div>
                        <div>
                          <div
                            className={`rounded-3xl px-4 py-3 shadow-sm ${
                              isMine
                                ? 'rounded-br-md border border-slate-900 bg-slate-900 text-white'
                                : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                            }`}
                          >
                            <p className="text-[14px] font-medium leading-6">{message.message}</p>
                          </div>
                          <div className={`mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                            isMine ? 'justify-end text-slate-400' : 'text-slate-400'
                          }`}>
                            <Clock3 size={11} />
                            <span>{formatTime(message.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-white p-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="mb-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[12px] font-semibold text-rose-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100"
              >
                <ShieldCheck size={16} />
              </button>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSend();
                  }
                }}
                placeholder={isAdminPanel ? 'Reply to support request' : 'Type a message to admin'}
                className="flex-1 bg-transparent text-[14px] font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !draft.trim()}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-all ${
                  sending || !draft.trim() ? 'bg-slate-300' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>

            {!isAdminPanel && (
              <div className="mx-auto mt-3 flex max-w-4xl flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button
                    type="button"
                    key={reply}
                    onClick={() => setDraft(reply)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupportChatPanel;
