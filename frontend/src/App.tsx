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
    <div className="flex h-screen w-screen bg-[#0b0f19] text-slate-100 overflow-hidden font-sans">
      {/* 1. Left Session Sidebar */}
      {isSidebarOpen && (
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
        />
      )}

      {/* 2. Main Workspace (Chat + Artifacts Split Pane) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Workspace Header Bar */}
        <header className="h-14 px-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-950/80 shrink-0" />
              <h2 className="text-xs font-semibold text-slate-200 truncate" title={currentSession?.title || 'New Session'}>
                {currentSession?.title || 'Lenny Growth Copilot'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dynamic LLM Provider Selector */}
            <ModelSelector
              providers={providers}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onSelect={(pId, mId) => {
                setSelectedProvider(pId);
                setSelectedModel(mId);
              }}
            />

            {/* Artifact Pane Toggle Button */}
            <button
              type="button"
              onClick={() => setIsArtifactPaneOpen(!isArtifactPaneOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isArtifactPaneOpen
                  ? 'bg-slate-800 text-emerald-300 border-slate-700'
                  : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
              }`}
              title="Toggle Artifact Viewer"
            >
              {isArtifactPaneOpen ? (
                <PanelRightClose className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Artifacts</span>
              {activeArtifact && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="bg-rose-500/15 border-b border-rose-500/30 px-4 py-2 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-rose-400 hover:text-rose-200 text-[11px] underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dual-Pane Viewport Container */}
        <main className="flex-1 flex overflow-hidden">
          {/* Left / Middle: Chat Interface Pane */}
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

          {/* Right: In-App Artifact Viewer (Claude Split-Pane) */}
          {isArtifactPaneOpen && (
            <div className="w-full md:w-[48%] lg:w-[45%] h-full shrink-0">
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
