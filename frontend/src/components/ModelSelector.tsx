import React, { useState } from 'react';
import { Cpu, Cloud, ChevronDown, Check, Zap, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { ProviderInfo } from '../services/api';

interface ModelSelectorProps {
  providers: ProviderInfo[];
  selectedProvider: string;
  selectedModel: string;
  onSelect: (providerId: string, modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  providers,
  selectedProvider,
  selectedModel,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentProvider = providers.find((p) => p.id === selectedProvider) || {
    id: 'ollama',
    name: 'Ollama (Local Default)',
    default_model: 'llama3:8b',
    is_available: true,
  };

  const isLocal = selectedProvider === 'ollama';

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glass-dock hover:border-emerald-500/40 text-xs font-medium text-slate-200 transition-all shadow-glow-glass focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <div className="flex items-center gap-1.5">
          {isLocal ? (
            <span className="flex items-center gap-1 text-emerald-400 font-semibold font-heading">
              <Cpu className="w-3.5 h-3.5" />
              <span>{currentProvider.name.split(' ')[0]}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-indigo-400 font-semibold font-heading">
              <Cloud className="w-3.5 h-3.5" />
              <span>{currentProvider.name.split(' ')[0]}</span>
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
            {selectedModel}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2.5 w-80 rounded-2xl glass-surface-elevated border border-white/[0.08] shadow-2xl z-50 overflow-hidden divide-y divide-white/[0.05] animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="px-4 py-3 bg-obsidian-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-heading tracking-wide uppercase text-slate-200">
                  LLM Provider Matrix
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Zap className="w-2.5 h-2.5" /> Runtime Switched
              </span>
            </div>

            {/* Providers List */}
            <div className="p-2 space-y-1.5 max-h-80 overflow-y-auto">
              {providers.map((prov) => {
                const isProvSelected = prov.id === selectedProvider;
                return (
                  <div
                    key={prov.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isProvSelected
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                          prov.id === 'ollama' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {prov.id === 'ollama' ? <Cpu className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-100 font-heading">{prov.name}</div>
                          <div className="text-[10px] text-slate-400">{prov.description}</div>
                        </div>
                      </div>

                      {prov.id === 'ollama' ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> 100% Private
                        </span>
                      ) : (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          prov.is_available
                            ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}>
                          {prov.is_available ? 'Configured' : 'Optional Key'}
                        </span>
                      )}
                    </div>

                    {/* Model Buttons */}
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {prov.models.map((modelId) => {
                        const isModelActive = isProvSelected && selectedModel === modelId;
                        return (
                          <button
                            key={modelId}
                            type="button"
                            onClick={() => {
                              onSelect(prov.id, modelId);
                              setIsOpen(false);
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-mono transition-all ${
                              isModelActive
                                ? 'bg-emerald-500 text-obsidian-950 font-bold shadow-md shadow-emerald-500/20'
                                : 'bg-obsidian-950/60 text-slate-300 hover:text-white hover:bg-obsidian-850 border border-white/[0.04]'
                            }`}
                          >
                            <span className="truncate">{modelId}</span>
                            {isModelActive && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-obsidian-950/90 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Server Restart Required</span>
              </span>
              <span className="text-emerald-400 font-mono">Instant Dispatch</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
