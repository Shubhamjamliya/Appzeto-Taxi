import React from 'react';
import {
  BadgePlus,
  Bot,
  CircleUser,
  Clock3,
  CornerDownLeft,
  MessageCircle,
  MoreVertical,
  Search,
  Settings2,
  Send,
  ShieldAlert,
  UserRound,
} from 'lucide-react';

const CONTACTS = [
  {
    id: 'm-saravanan',
    name: 'M.SARAVANAN',
    role: 'driver',
    lastMessage: 'hi',
    time: '31 Mar 2026 05:04 PM',
    active: true,
    unread: 0,
  },
  { id: 'vipin', name: 'vipin', role: 'user', lastMessage: 'Need help with refund', time: '31 Mar 2026 04:22 PM', active: false, unread: 2 },
  { id: 'indradevi', name: 'indradevi', role: 'user', lastMessage: 'Trip got delayed', time: '30 Mar 2026 09:10 AM', active: false, unread: 0 },
  { id: 'devi', name: 'devi', role: 'driver', lastMessage: 'Payment not received', time: '30 Mar 2026 08:41 AM', active: false, unread: 1 },
];

const MESSAGES = [
  { id: 1, sender: 'admin', text: 'Hello, how can I help you today?', time: '31 Mar 2026 05:03 PM' },
  { id: 2, sender: 'user', text: 'hi', time: '31 Mar 2026 05:04 PM' },
];

const Chat = () => {
  const [selectedId, setSelectedId] = React.useState(CONTACTS[0].id);
  const [draft, setDraft] = React.useState('');
  const [messages, setMessages] = React.useState(MESSAGES);
  const selected = CONTACTS.find((item) => item.id === selectedId) || CONTACTS[0];

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'admin',
        text,
        time: 'Just now',
      },
    ]);
    setDraft('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Admin Inbox</p>
          <h1 className="mt-1 text-[22px] font-black tracking-tight text-slate-900">Chats</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-2 text-[12px] font-black uppercase tracking-[0.22em] text-cyan-700">
          <BadgePlus size={14} />
          New
        </button>
      </div>

      <div className="grid min-h-[calc(100vh-190px)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm xl:grid-cols-[320px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Direct Messages</p>
              <h2 className="mt-1 text-[18px] font-black tracking-tight text-slate-900">Chats</h2>
            </div>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <PlusIcon />
            </button>
          </div>

          <div className="px-5 pb-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search chats"
                className="w-full bg-transparent text-[13px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1 px-2 pb-4">
            {CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                  selectedId === contact.id ? 'bg-cyan-100/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    {contact.role === 'driver' ? <CircleUser size={18} /> : <UserRound size={18} />}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[14px] font-black uppercase tracking-[0.06em] text-slate-900">{contact.name}</p>
                    {contact.unread > 0 && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-black text-white">{contact.unread}</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold capitalize text-slate-500">{contact.role}</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-slate-400">{contact.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col bg-[linear-gradient(180deg,#fafbff_0%,#f3f5fb_100%)]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <CircleUser size={20} />
              </div>
              <div>
                <h2 className="text-[16px] font-black uppercase tracking-[0.08em] text-slate-900">{selected.name}</h2>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-700">Active now</p>
              </div>
            </div>
            <button className="text-slate-500 hover:text-slate-900">
              <Settings2 size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-5 py-5">
            <div className="mx-auto max-w-4xl space-y-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`flex max-w-[72%] items-end gap-3 ${message.sender === 'admin' ? '' : 'flex-row-reverse'}`}>
                    <div className="h-8 w-8 rounded-full bg-white shadow-sm ring-1 ring-slate-200 flex items-center justify-center text-slate-400">
                      {message.sender === 'admin' ? <Bot size={15} /> : <CircleUser size={15} />}
                    </div>
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.sender === 'admin'
                            ? 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                            : 'rounded-br-md border border-cyan-200 bg-cyan-100 text-slate-900'
                        }`}
                      >
                        <p className="text-[14px] font-medium leading-6">{message.text}</p>
                      </div>
                      <div className={`mt-1 flex items-center gap-2 text-[11px] font-bold text-slate-400 ${message.sender === 'admin' ? '' : 'justify-end'}`}>
                        <span>{message.time}</span>
                        <span className="text-cyan-600">Check</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
              <CornerDownLeft size={16} className="text-slate-400" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Enter Message"
                className="flex-1 bg-transparent text-[14px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button className="text-orange-500">
                <ShieldAlert size={16} />
              </button>
              <button
                onClick={send}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-sm transition-all hover:bg-teal-600"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const PlusIcon = () => <span className="text-[18px] font-black leading-none text-cyan-500">+</span>;

export default Chat;
