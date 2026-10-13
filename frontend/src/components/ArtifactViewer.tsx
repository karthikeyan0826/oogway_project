import React, { useState } from 'react';
import { Eye, Code, Copy, Check, X, ShieldAlert, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { Artifact } from '../services/api';

interface ArtifactViewerProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifact, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!artifact) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#090d16] text-slate-500 border-l border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Artifact Sandbox Ready</h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Ask the assistant to generate an atomic essay, growth framework, or interactive document to preview it live here.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = artifact.raw_code || artifact.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`h-full flex flex-col bg-[#090d16] border-l border-slate-800 transition-all duration-200 ${
        isExpanded ? 'fixed inset-y-0 right-0 z-50 w-full md:w-3/4 shadow-2xl' : 'w-full'
      }`}
    >
      {/* Top Header Bar */}
      <div className="h-14 px-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950 shrink-0" />
          <h2 className="text-xs font-semibold text-slate-200 truncate" title={artifact.title}>
            {artifact.title}
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase shrink-0">
            {artifact.type}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="Copy source code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors hidden md:block"
            title={isExpanded ? 'Minimize' : 'Maximize'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            title="Close artifact"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="px-4 py-1.5 bg-slate-950 border-b border-slate-800/60 text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldAlert className="w-3 h-3 text-emerald-400" />
          <span>Strict Sandbox Isolation Active: iframe sandbox=&quot;allow-scripts&quot;</span>
        </span>
        <span className="text-slate-500 font-mono">Origin Isolated</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#0f172a]">
        {activeTab === 'preview' ? (
          <iframe
            srcDoc={artifact.content}
            title={artifact.title}
            sandbox="allow-scripts"
            className="w-full h-full border-none bg-[#0f172a]"
          />
        ) : (
          <div className="w-full h-full overflow-auto p-4 bg-[#0a0f1d] text-slate-200 font-mono text-xs leading-relaxed">
            <pre className="whitespace-pre-wrap">{artifact.raw_code || artifact.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
