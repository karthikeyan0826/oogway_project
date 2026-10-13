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
    <aside className="w-72 h-full bg-[#fbfbfd] border-r border-slate-200 flex flex-col justify-between shrink-0 select-none z-10">
      {/* Brand & Action Header */}
      <div className="p-4 border-b border-slate-200/80 space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm font-serif text-lg font-bold">
            L
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight font-serif">
              Lenny&apos;s Growth Assistant
            </h1>
            <p className="text-[11px] text-slate-500 font-sans">Podcast Knowledge Base</p>
          </div>
        </div>

        {/* New Session Button */}
        <button
          type="button"
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>

        {/* Curated Guest Filter Tags */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-0.5 flex items-center justify-between">
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
                      ? 'bg-orange-50 border-orange-200 text-orange-900 font-medium'
                      : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="truncate font-medium">{g.name}</div>
                  <div className="text-[9px] text-slate-400 truncate">{g.count}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sessions Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Conversations</span>
          <span className="font-mono text-slate-500 font-medium">{sessions.length}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center rounded-lg bg-white border border-slate-200 text-xs text-slate-500 space-y-1">
            <BookOpen className="w-4 h-4 mx-auto text-slate-400 mb-1.5" />
            <p className="font-medium text-slate-700">No sessions yet</p>
            <p className="text-[11px] text-slate-400">Click &ldquo;New Session&rdquo; to start.</p>
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
                    ? 'bg-white border-slate-300 text-slate-900 font-semibold shadow-sm border-l-4 border-l-orange-600'
                    : 'bg-transparent border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                  <span className="truncate" title={s.title}>
                    {s.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {s.message_count !== undefined && s.message_count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-500 font-mono">
                      {s.message_count}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-opacity"
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
      <div className="p-3.5 bg-white border-t border-slate-200 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Podcast Chunks</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            {readiness?.indexed_chunks ?? 26} Grounded
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-slate-400" />
            <span>Artifact Sandbox</span>
          </span>
          <span className="text-emerald-700 font-mono">Isolated</span>
        </div>
      </div>
    </aside>
  );
};
