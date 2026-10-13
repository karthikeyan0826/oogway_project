import React, { useState } from 'react';
import { ChevronDown, Check, ShieldCheck, Laptop, Globe } from 'lucide-react';
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-xs font-medium text-slate-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          {isLocal ? (
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Laptop className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentProvider.name.split(' ')[0]}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentProvider.name.split(' ')[0]}</span>
            </span>
          )}
          <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {selectedModel}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? 'rotate-180 text-slate-600' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden divide-y divide-slate-100">
            {/* Header */}
            <div className="px-3.5 py-2.5 bg-slate-50/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Model Settings
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                Active Runtime
              </span>
            </div>

            {/* Providers */}
            <div className="p-1.5 space-y-1 max-h-72 overflow-y-auto">
              {providers.map((prov) => {
                const isProvSelected = prov.id === selectedProvider;
                return (
                  <div
                    key={prov.id}
                    className={`p-2 rounded-lg border transition-colors ${
                      isProvSelected
                        ? 'bg-orange-50/40 border-orange-200'
                        : 'bg-white border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {prov.id === 'ollama' ? (
                          <Laptop className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        <span className="text-xs font-semibold text-slate-800">{prov.name}</span>
                      </div>

                      {prov.id === 'ollama' ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-100/60 text-emerald-800">
                          Local Private
                        </span>
                      ) : (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          prov.is_available
                            ? 'bg-indigo-100/60 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {prov.is_available ? 'Configured' : 'Optional Key'}
                        </span>
                      )}
                    </div>

                    {/* Models */}
                    <div className="grid grid-cols-2 gap-1 mt-1.5">
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
                            className={`flex items-center justify-between px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                              isModelActive
                                ? 'bg-orange-600 text-white font-medium shadow-sm'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                            }`}
                          >
                            <span className="truncate">{modelId}</span>
                            {isModelActive && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-3.5 py-2 bg-slate-50 text-[10px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-slate-400" />
                <span>Zero service restart required</span>
              </span>
              <span className="text-slate-600 font-medium">Instant</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
