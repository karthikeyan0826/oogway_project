import React, { useState } from 'react';
import { useChat } from './hooks/useChat';
import { SessionSidebar } from './components/SessionSidebar';
import { ChatInterface } from './components/ChatInterface';
import { ArtifactViewer } from './components/ArtifactViewer';
import { ModelSelector } from './components/ModelSelector';
import { AlertCircle, PanelRightOpen, PanelRightClose, Menu } from 'lucide-react';

export const App: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    error,
    activeArtifact,
    setActiveArtifact,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    providers,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    clearError,
  } = useChat();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isArtifactPaneOpen, setIsArtifactPaneOpen] = useState(true);

  // Active session object
  const currentSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div className="flex h-screen w-screen bg-obsidian-950 text-slate-100 overflow-hidden font-sans selection:bg-emerald-500 selection:text-obsidian-950">
      {/* 1. Left Intelligence Sidebar */}
      {isSidebarOpen && (
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
        />
      )}

      {/* 2. Main Executive Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-obsidian-900">
        {/* Top Executive Header Bar */}
        <header className="h-14 px-4 md:px-6 bg-obsidian-950/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.04] transition-all"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 overflow-hidden">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>

              <h2 className="text-xs font-bold font-heading text-slate-200 truncate tracking-tight" title={currentSession?.title || 'Lenny Growth Copilot'}>
                {currentSession?.title || 'Lenny Growth Copilot'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dynamic Runtime Model Switcher */}
            <ModelSelector
              providers={providers}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onSelect={(pId, mId) => {
                setSelectedProvider(pId);
                setSelectedModel(mId);
              }}
            />

            {/* Split Canvas Workspace Toggle */}
            <button
              type="button"
              onClick={() => setIsArtifactPaneOpen(!isArtifactPaneOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold border transition-all ${
                isArtifactPaneOpen
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow-emerald'
                  : 'glass-pill text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Studio Canvas"
            >
              {isArtifactPaneOpen ? (
                <PanelRightClose className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Studio Canvas</span>
              {activeArtifact && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>
        </header>

        {/* Floating Toast Error Banner */}
        {error && (
          <div className="mx-4 mt-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300 shadow-lg animate-in fade-in duration-150">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dual-Pane Viewport Container */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Left/Middle Pane: Chat Stream */}
          <div className="flex-1 h-full min-w-0">
            <ChatInterface
              messages={messages}
              isLoading={isLoading}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onSendMessage={sendMessage}
              onOpenArtifact={(artifact) => {
                setActiveArtifact(artifact);
                setIsArtifactPaneOpen(true);
              }}
            />
          </div>

          {/* Right Pane: Sandboxed Studio Artifact Viewer */}
          {isArtifactPaneOpen && (
            <div className="w-full md:w-[48%] lg:w-[46%] h-full shrink-0 animate-in slide-in-from-right-4 duration-200">
              <ArtifactViewer
                artifact={activeArtifact}
                onClose={() => setIsArtifactPaneOpen(false)}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
