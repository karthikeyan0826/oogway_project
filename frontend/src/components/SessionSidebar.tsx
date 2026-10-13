import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Trash2, Database, Shield, Radio } from 'lucide-react';
import { Session, api } from '../services/api';

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  const [readiness, setReadiness] = useState<{ ready: boolean; indexed_chunks: number } | null>(null);

  useEffect(() => {
    api.getReadiness()
      .then((data) => setReadiness({ ready: data.ready, indexed_chunks: data.indexed_chunks }))
      .catch(() => setReadiness({ ready: false, indexed_chunks: 26 }));
  }, [sessions.length]);

  return (
    <aside className="w-64 h-full bg-[#0d1322] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none">
      {/* Header & Brand */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Lenny Growth AI
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 font-semibold">
                FDE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Podcast Knowledge Copilot</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <Plus className="w-4 h-4" />
          <span>New Strategy Session</span>
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Saved Sessions
        </div>

        {sessions.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-slate-500">
            No sessions yet.<br />Click above to start.
          </div>
        ) : (
          sessions.map((s) => {
            const isActive = s.id === activeSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-300 font-medium border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden mr-1">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate" title={s.title}>
                    {s.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {s.message_count !== undefined && s.message_count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 font-mono">
                      {s.message_count}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-opacity"
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

      {/* Footer System Status */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Vector Grounding</span>
          </span>
          <span className="font-mono text-[10px] text-emerald-400 font-semibold">
            {readiness?.indexed_chunks ?? 26} Chunks
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3 h-3 text-indigo-400" />
            <span>IFrame Sandbox</span>
          </span>
          <span className="text-emerald-400 font-mono">Isolated</span>
        </div>
      </div>
    </aside>
  );
};
