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
    <div className="relative inline-block text-left font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-xs font-medium text-stone-800 shadow-xs transition-all focus:outline-none focus:ring-1 focus:ring-stone-400"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          {isLocal ? (
            <span className="flex items-center gap-1 text-stone-700 font-medium">
              <Laptop className="w-3.5 h-3.5 text-stone-500" />
              <span>{currentProvider.name.split(' ')[0]}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-stone-700 font-medium">
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{currentProvider.name.split(' ')[0]}</span>
            </span>
          )}
          <span className="text-[11px] text-stone-600 font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
            {selectedModel}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-150 ${isOpen ? 'rotate-180 text-stone-600' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-stone-200 shadow-elevated z-50 overflow-hidden divide-y divide-stone-100">
            {/* Header */}
            <div className="px-3.5 py-2.5 bg-stone-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">
                Model Settings
              </span>
              <span className="text-[10px] text-stone-700 bg-stone-200/70 px-2 py-0.5 rounded font-mono border border-stone-300">
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
                        ? 'bg-stone-50 border-stone-300'
                        : 'bg-white border-transparent hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        {prov.id === 'ollama' ? (
                          <Laptop className="w-3.5 h-3.5 text-stone-500" />
                        ) : (
                          <Globe className="w-3.5 h-3.5 text-stone-500" />
                        )}
                        <span className="text-xs font-semibold text-stone-800">{prov.name}</span>
                      </div>

                      {prov.id === 'ollama' ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                          Local Private
                        </span>
                      ) : (
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          prov.is_available
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-stone-100 text-stone-500'
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
                                ? 'bg-stone-900 text-white font-medium shadow-xs'
                                : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/80'
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
