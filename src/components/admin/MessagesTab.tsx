import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  ExternalLink,
  Clock,
  Sparkles,
  Phone,
  Mail,
  CheckCheck
} from 'lucide-react';
import { api } from '../../lib/api';

interface MessagesTabProps {
  onSelectApplication: (appId: string) => void;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({ onSelectApplication }) => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedThread, setSelectedThread] = useState<any | null>(null);
  const [messageText, setMessageText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminMessageThreads();
      if (res && res.threads) {
        setThreads(res.threads);
        if (!selectedThread && res.threads.length > 0) {
          setSelectedThread(res.threads[0]);
        } else if (selectedThread) {
          const updated = res.threads.find((t: any) => t.application_id === selectedThread.application_id);
          if (updated) setSelectedThread(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load message threads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !messageText.trim()) return;

    try {
      setSending(true);
      await api.sendMessage(selectedThread.application_id, messageText.trim());
      setMessageText('');
      await fetchThreads();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.customer_name.toLowerCase().includes(q) ||
        t.reference_number.toLowerCase().includes(q) ||
        t.last_message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-[12px] border border-slate-200 shadow-xs overflow-hidden h-[640px] flex flex-col md:flex-row pb-0 animate-fadeIn">
      {/* Left Column: Thread List (320px) */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-white shrink-0">
        <div className="p-3.5 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F95A5]" />
            <input
              type="text"
              placeholder="Search conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredThreads.map((th) => {
            const isSelected = selectedThread?.application_id === th.application_id;
            return (
              <div
                key={th.application_id}
                onClick={() => setSelectedThread(th)}
                className={`p-3.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-[#EFF4FF] border-l-4 border-[#2D62FF]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-[#0B0B0F] truncate">{th.customer_name}</span>
                  <span className="text-[10px] text-[#8F95A5]">
                    {new Date(th.last_message_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#2D62FF]">{th.reference_number}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-[#5A5F71] border border-slate-200 font-semibold">
                    {th.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#5A5F71] line-clamp-1">{th.last_message}</p>
              </div>
            );
          })}

          {filteredThreads.length === 0 && (
            <div className="text-center py-14 text-xs text-[#8F95A5]">
              No message threads found
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Chat Conversation Stream */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col bg-slate-50">
          {/* Active Conversation Header */}
          <div className="bg-white border-b border-slate-200 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2D62FF] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {selectedThread.customer_name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#0B0B0F]">{selectedThread.customer_name}</h3>
                <p className="text-[10px] text-[#8F95A5]">
                  Ref: <span className="font-mono font-bold text-[#2D62FF]">{selectedThread.reference_number}</span> • {selectedThread.customer_phone}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectApplication(selectedThread.application_id)}
              className="px-3 py-1.5 text-xs font-bold text-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF] hover:text-white rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Open Dossier</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedThread.messages.map((msg: any) => {
              const isStaff = msg.sender_role !== 'CUSTOMER';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${isStaff ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className="text-[10px] text-[#8F95A5] mb-0.5">
                    {msg.sender_name} ({msg.sender_role}) • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div
                    className={`p-3.5 rounded-[12px] text-xs leading-relaxed ${
                      isStaff
                        ? 'bg-[#2D62FF] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-[#0B0B0F] border border-slate-200 rounded-bl-xs shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <div className="bg-white border-t border-slate-200 p-3">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Type response to borrower..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 py-2.5 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#2D62FF] hover:bg-blue-700 disabled:opacity-50 rounded-[10px] flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-xs text-[#8F95A5] bg-slate-50">
          <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
          <p className="font-bold text-[#0B0B0F]">No Conversation Selected</p>
          <p className="mt-1">Choose a borrower message thread on the left to review chat history.</p>
        </div>
      )}
    </div>
  );
};
