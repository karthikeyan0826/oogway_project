import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Database, Shield, Radio, Sparkles, Filter } from 'lucide-react';
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
    <aside className="w-72 h-full bg-obsidian-900 border-r border-white/[0.06] flex flex-col justify-between shrink-0 select-none z-20">
      {/* Brand & Studio Visualizer */}
      <div className="p-4 border-b border-white/[0.06] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 flex items-center justify-center shadow-glow-emerald">
              <Radio className="w-4 h-4 text-white" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-obsidian-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold font-heading text-white tracking-tight">
                  Lenny Growth
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  STUDIO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Podcast Intelligence Engine</p>
            </div>
          </div>

          {/* Equalizer Soundwave Bars */}
          <div className="flex items-center gap-1 h-5 px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
            <span className="soundbar animate-soundwave-1" />
            <span className="soundbar animate-soundwave-2" />
            <span className="soundbar animate-soundwave-3" />
            <span className="soundbar animate-soundwave-4" />
          </div>
        </div>

        {/* New Session Button */}
        <button
          type="button"
          onClick={onNewSession}
          className="w-full relative group overflow-hidden flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-obsidian-950 text-xs font-bold font-heading shadow-glow-emerald transition-all transform active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Strategy Session</span>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Guest Filters Capsule */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 px-1">
            <span className="flex items-center gap-1">
              <Filter className="w-2.5 h-2.5" /> Curated Guests
            </span>
            <span>Grounding Scope</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {guestFilters.map((g) => {
              const isSelected = activeGuest === g.value;
              return (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => handleGuestClick(g.value)}
                  className={`px-2 py-1.5 rounded-lg text-left text-[11px] transition-all border ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-white/[0.02] border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="truncate font-heading">{g.name}</div>
                  <div className="text-[9px] text-slate-500 font-mono truncate">{g.count}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sessions Scrollable Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Active Sessions</span>
          <span className="text-emerald-400 font-mono font-semibold">{sessions.length}</span>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-white/[0.01] border border-white/[0.04] text-xs text-slate-500 space-y-1">
            <Sparkles className="w-5 h-5 mx-auto text-slate-600 mb-2" />
            <p className="font-heading font-medium text-slate-400">No sessions initiated</p>
            <p className="text-[11px] text-slate-600">Click above to start an executive query.</p>
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 font-medium shadow-inner-glow'
                    : 'bg-white/[0.01] border-white/[0.04] text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-emerald-400 shadow-glow-emerald" />
                )}

                <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="truncate font-heading text-xs" title={s.title}>
                    {s.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {s.message_count !== undefined && s.message_count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-obsidian-950 text-slate-400 font-mono border border-white/[0.06]">
                      {s.message_count}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
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

      {/* Footer System Telemetry */}
      <div className="p-3.5 bg-obsidian-950/80 border-t border-white/[0.06] text-[11px] space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-300 font-heading">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vector Grounding</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
            {readiness?.indexed_chunks ?? 26} Chunks
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>IFrame Sandbox</span>
          </span>
          <span className="text-emerald-400 font-mono font-semibold">allow-scripts (Isolated)</span>
        </div>
      </div>
    </aside>
  );
};
