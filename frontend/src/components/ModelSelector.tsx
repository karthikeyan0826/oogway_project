import React, { useState } from 'react';
import { Cpu, Cloud, ChevronDown, Check, ShieldCheck, AlertCircle } from 'lucide-react';
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
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded bg-emerald-500/10 text-emerald-400">
          {isLocal ? <Cpu className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5 text-indigo-400" />}
        </span>
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-100">{currentProvider.name.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-400 font-mono">({selectedModel})</span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
            <div className="px-3 py-2 bg-slate-950/60 text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center justify-between">
              <span>Select LLM Provider</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Runtime Switching
              </span>
            </div>

            <div className="p-1 space-y-1">
              {providers.map((prov) => {
                const isProvSelected = prov.id === selectedProvider;
                return (
                  <div key={prov.id} className="p-1 rounded-lg hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center justify-between px-2 py-1">
                      <div className="flex items-center gap-2">
                        {prov.id === 'ollama' ? (
                          <Cpu className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Cloud className="w-4 h-4 text-indigo-400" />
                        )}
                        <span className="text-xs font-medium text-slate-200">{prov.name}</span>
                      </div>
                      {prov.is_available ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" title="Available" />
                      ) : (
                        <span className="text-[10px] text-amber-400 flex items-center gap-0.5" title="Key not configured">
                          <AlertCircle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    <div className="mt-1 pl-6 space-y-0.5">
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
                            className={`w-full flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                              isModelActive
                                ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                          >
                            <span>{modelId}</span>
                            {isModelActive && <Check className="w-3 h-3 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-950/80 text-[10px] text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-300">Local Privacy:</span> Ollama executes 100% on your machine. Cloud keys fallback seamlessly.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
