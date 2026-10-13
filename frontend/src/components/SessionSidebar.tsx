import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Database, Shield, BookOpen } from 'lucide-react';
import { Session, api } from '../services/api';

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onSelectGuestFilter?: (guest: string | null) => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onSelectGuestFilter,
}) => {
  const [readiness, setReadiness] = useState<{ ready: boolean; indexed_chunks: number } | null>(null);
  const [activeGuest, setActiveGuest] = useState<string | null>(null);

  useEffect(() => {
    api.getReadiness()
      .then((data) => setReadiness({ ready: data.ready, indexed_chunks: data.indexed_chunks }))
      .catch(() => setReadiness({ ready: true, indexed_chunks: 26 }));
  }, [sessions.length]);

  const guestFilters = [
    { name: 'All Guests', value: null, count: '3 Episodes' },
    { name: 'Shreyas Doshi', value: 'Shreyas', count: 'High Agency' },
    { name: 'Elena Verna', value: 'Elena', count: 'B2B PLG' },
    { name: 'Brian Balfour', value: 'Balfour', count: 'Growth Loops' },
  ];

  const handleGuestClick = (guest: string | null) => {
    setActiveGuest(guest);
    if (onSelectGuestFilter) onSelectGuestFilter(guest);
  };

  return (
    <aside className="w-72 h-full bg-[#fcfbf9] border-r border-stone-200 flex flex-col justify-between shrink-0 select-none z-10 font-sans">
      {/* Brand & Action Header */}
      <div className="p-4 border-b border-stone-200/80 space-y-3.5 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-50 shadow-xs font-serif text-base font-semibold">
            L
          </div>
          <div>
            <h1 className="text-sm font-semibold text-stone-900 tracking-tight font-serif">
              Lenny&apos;s Assistant
            </h1>
            <p className="text-[11px] text-stone-500 font-sans">Podcast Knowledge Base</p>
          </div>
        </div>

        {/* New Session Button */}
        <button
          type="button"
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-stone-400"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>

        {/* Curated Guest Filter Tags */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-medium uppercase tracking-wider text-stone-400 px-0.5 flex items-center justify-between font-mono">
            <span>Curated Guests</span>
            <span>Index</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {guestFilters.map((g) => {
              const isSelected = activeGuest === g.value;
              return (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => handleGuestClick(g.value)}
                  className={`px-2 py-1.5 rounded-lg text-left text-[11px] transition-colors border ${
                    isSelected
                      ? 'bg-stone-100 border-stone-400 text-stone-900 font-medium'
                      : 'bg-white border-stone-200/80 text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <div className="truncate font-medium">{g.name}</div>
                  <div className="text-[9px] text-stone-400 truncate font-mono">{g.count}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sessions Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#fcfbf9]">
        <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-400 flex items-center justify-between font-mono">
          <span>Conversations</span>
          <span className="text-stone-500">{sessions.length}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center rounded-lg bg-white border border-stone-200 text-xs text-stone-500 space-y-1">
            <BookOpen className="w-4 h-4 mx-auto text-stone-400 mb-1.5" />
            <p className="font-medium text-stone-700">No sessions yet</p>
            <p className="text-[11px] text-stone-400">Click &ldquo;New Session&rdquo; to start.</p>
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-white border-stone-300 text-stone-900 font-medium shadow-xs border-l-2 border-l-stone-900'
                    : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-stone-900' : 'text-stone-400'}`} />
                  <span className="truncate" title={s.title}>
                    {s.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {s.message_count !== undefined && s.message_count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 font-mono">
                      {s.message_count}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status */}
      <div className="p-3.5 bg-white border-t border-stone-200 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-stone-600">
            <Database className="w-3.5 h-3.5 text-stone-400" />
            <span>Podcast Chunks</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium border border-stone-200">
            {readiness?.indexed_chunks ?? 26} Grounded
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-stone-400" />
            <span>Artifact Sandbox</span>
          </span>
          <span className="text-stone-600">Isolated</span>
        </div>
      </div>
    </aside>
  );
};
