import React, { useState } from 'react';
import { Eye, Code, Copy, Check, X, ShieldCheck, Sparkles, Maximize2, Minimize2, Download } from 'lucide-react';
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
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-obsidian-900 text-slate-500 border-l border-white/[0.06] relative overflow-hidden">
        {/* Subtle Background Radial Aura */}
        <div className="absolute w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center text-slate-400 mb-4 shadow-glow-glass">
          <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
        </div>
        <h3 className="text-sm font-bold font-heading text-slate-200 mb-1.5">
          Dual-Pane Studio Canvas
        </h3>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-sans">
          Ask the assistant to draft a <span className="text-emerald-400 font-semibold">Ship 30 for 30 essay</span>, product roadmap, or growth loop framework to render live here in real-time.
        </p>

        <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.05] text-[10px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict IFrame Security Sandbox Active</span>
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
      className={`h-full flex flex-col bg-obsidian-900 border-l border-white/[0.08] transition-all duration-300 z-30 ${
        isExpanded ? 'fixed inset-y-0 right-0 z-50 w-full md:w-3/4 shadow-2xl backdrop-blur-3xl' : 'w-full'
      }`}
    >
      {/* Studio Header Bar with MacOS Dots */}
      <div className="h-14 px-4 bg-obsidian-950/90 border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* MacOS Window Controls Accent */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition-colors" onClick={onClose} title="Close" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition-colors" onClick={() => setIsExpanded(!isExpanded)} title="Expand" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors" title="Active" />
          </div>

          <div className="h-4 w-px bg-white/[0.08] mx-1" />

          <div className="flex items-center gap-2 overflow-hidden">
            <h2 className="text-xs font-bold font-heading text-slate-100 truncate" title={artifact.title}>
              {artifact.title}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 uppercase font-semibold shrink-0">
              {artifact.type}
            </span>
          </div>
        </div>

        {/* Action Controls & Tab Switcher */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Tabs */}
          <div className="flex items-center bg-obsidian-950 rounded-xl p-1 border border-white/[0.06] shadow-inner-glow">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium font-heading transition-all ${
                activeTab === 'preview'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-obsidian-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium font-heading transition-all ${
                activeTab === 'code'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-obsidian-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Source</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.06] transition-all active:scale-95"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.06] transition-all active:scale-95"
            title="Download deliverable"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 hover:text-white border border-white/[0.06] transition-all hidden md:block active:scale-95"
            title={isExpanded ? 'Collapse' : 'Fullscreen studio'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/[0.06] transition-all"
            title="Close viewer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Security Isolation Status Bar */}
      <div className="px-4 py-2 bg-obsidian-950/70 border-b border-white/[0.04] text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>IFrame Isolation Policy: sandbox=&quot;allow-scripts&quot;</span>
        </span>
        <span className="text-slate-500 font-mono">Zero Parent Origin Access</span>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-hidden relative bg-[#0a0e1a]">
        {activeTab === 'preview' ? (
          <iframe
            srcDoc={artifact.content}
            title={artifact.title}
            sandbox="allow-scripts"
            className="w-full h-full border-none bg-[#0a0e1a]"
          />
        ) : (
          <div className="w-full h-full overflow-auto p-5 bg-[#05070d] text-slate-200 font-mono text-xs leading-relaxed">
            <pre className="whitespace-pre-wrap">{artifact.raw_code || artifact.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
