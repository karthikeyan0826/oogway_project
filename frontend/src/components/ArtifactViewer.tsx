import React, { useState } from 'react';
import { Eye, Code, Copy, Check, X, ShieldCheck, FileText, Maximize2, Minimize2, Download } from 'lucide-react';
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#fafafa] text-slate-500 border-l border-slate-200 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
          <FileText className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-sm font-bold font-serif text-slate-800 mb-1">
          Canvas Pane Ready
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
          Generated essays, framework diagrams, and product briefs will render beside the chat window.
        </p>

        <div className="mt-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>IFrame Isolation Sandbox</span>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = artifact.raw_code || artifact.content;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.raw_code || artifact.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`h-full flex flex-col bg-[#fafafa] border-l border-slate-200 transition-all duration-200 z-30 ${
        isExpanded ? 'fixed inset-y-0 right-0 z-50 w-full md:w-3/4 shadow-2xl' : 'w-full'
      }`}
    >
      {/* Studio Header Bar */}
      <div className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-700 shrink-0">
            <FileText className="w-4 h-4" />
          </div>

          <div className="overflow-hidden">
            <h2 className="text-xs font-bold font-serif text-slate-900 truncate" title={artifact.title}>
              {artifact.title}
            </h2>
            <div className="text-[10px] text-slate-400 font-mono uppercase">
              {artifact.type} deliverable
            </div>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          </div>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-sm"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors shadow-sm"
            title="Download deliverable"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Expand */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors hidden md:block shadow-sm"
            title={isExpanded ? 'Collapse' : 'Fullscreen'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors shadow-sm"
            title="Close canvas"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security Status Bar */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-slate-600 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>IFrame Isolation: sandbox=&quot;allow-scripts&quot;</span>
        </span>
        <span className="text-slate-400 font-mono">Zero Parent Origin Access</span>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {activeTab === 'preview' ? (
          <iframe
            srcDoc={artifact.content}
            title={artifact.title}
            sandbox="allow-scripts"
            className="w-full h-full border-none bg-white"
          />
        ) : (
          <div className="w-full h-full overflow-auto p-5 bg-slate-50 text-slate-800 font-mono text-xs leading-relaxed border-t border-slate-200">
            <pre className="whitespace-pre-wrap">{artifact.raw_code || artifact.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
