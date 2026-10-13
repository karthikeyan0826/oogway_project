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
    <div className="flex h-screen w-screen bg-white text-slate-900 overflow-hidden font-sans selection:bg-orange-100 selection:text-orange-900">
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

      {/* 2. Main Executive Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-white">
        {/* Top Header Bar */}
        <header className="h-14 px-4 md:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
              <h2 className="text-xs font-semibold font-serif text-slate-800 truncate" title={currentSession?.title || 'Lenny Growth Copilot'}>
                {currentSession?.title || 'Lenny\'s Growth Copilot'}
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isArtifactPaneOpen
                  ? 'bg-slate-100 border-slate-300 text-slate-900 font-semibold'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
              title="Toggle Canvas"
            >
              {isArtifactPaneOpen ? (
                <PanelRightClose className="w-3.5 h-3.5 text-orange-600" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Canvas</span>
              {activeArtifact && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              )}
            </button>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-2 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-800 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={clearError}
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-900 hover:bg-rose-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dual-Pane Viewport Container */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* Left/Middle: Chat Stream */}
          <div className="flex-1 h-full min-w-0 bg-white">
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

          {/* Right: Sandboxed Studio Artifact Viewer */}
          {isArtifactPaneOpen && (
            <div className="w-full md:w-[48%] lg:w-[46%] h-full shrink-0">
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
