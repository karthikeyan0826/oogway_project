import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, BookOpen, ExternalLink, Radio, PenTool, 
  CheckCircle, Zap, Shield, ArrowUpRight, Compass, Flame,
  FileText
} from 'lucide-react';
import { Message, Citation, Artifact } from '../services/api';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  selectedProvider: string;
  selectedModel: string;
  onSendMessage: (text: string, skill?: string) => void;
  onOpenArtifact: (artifact: Artifact) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  selectedProvider,
  selectedModel,
  onSendMessage,
  onOpenArtifact,
}) => {
  const [inputText, setInputText] = useState('');
  const [isShip30Mode, setIsShip30Mode] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const skill = isShip30Mode ? 'ship30' : undefined;
    onSendMessage(inputText.trim(), skill);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const starterPlaybooks = [
    {
      guest: 'Shreyas Doshi',
      role: 'Stripe, Twitter PM Lead',
      title: 'High Agency & LNO Framework',
      desc: 'Bending reality vs accepting corporate constraints, and managing energy across Leverage, Neutral, Overhead tasks.',
      prompt: 'Draft a Ship 30 for 30 essay on Shreyas Doshi\'s High Agency framework and LNO time management.',
      skill: 'ship30',
      badge: 'Atomic Essay',
      icon: Flame,
    },
    {
      guest: 'Brian Balfour',
      role: 'Founder & CEO, Reforge',
      title: 'Compounding Loops vs Funnels',
      desc: 'Why linear Pirate Metrics (AARRR) cause CAC inflation, and how to align the Four Fits Framework.',
      prompt: 'Explain Brian Balfour\'s Four Growth Fits framework and why compounding loops beat linear funnels.',
      skill: undefined,
      badge: 'Growth Engine',
      icon: Compass,
    },
    {
      guest: 'Elena Verna',
      role: 'Growth Advisor, Miro & Amplitude',
      title: 'B2B PLG & Product-Led Sales',
      desc: 'Defining true Product-Led Growth, timing sales engagement, and identifying Product Qualified Leads (PQLs).',
      prompt: 'What are Elena Verna\'s rules for Product Qualified Leads (PQLs) and when should sales engage with users?',
      skill: undefined,
      badge: 'PLG Playbook',
      icon: Zap,
    },
    {
      guest: 'Shreyas Doshi',
      role: 'Product Leadership',
      title: 'Good vs Great PM Superpowers',
      desc: 'The three superpowers that separate top 1% PMs: Product Sense, Strategic Clarity, and High-Stakes Communication.',
      prompt: 'What separates a good product manager from a great product manager according to Shreyas Doshi?',
      skill: undefined,
      badge: 'Career Moat',
      icon: Sparkles,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-aurora-mesh relative overflow-hidden">
      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-6 space-y-8 animate-in fade-in duration-300">
            {/* Studio Welcome Hero */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-dock text-emerald-400 text-xs font-mono font-medium shadow-glow-glass">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span className="font-semibold text-slate-200">Grounded Growth Intelligence</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Verified Corpus
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold font-heading tracking-tight text-white">
                The Lenny Growth Assistant
              </h1>

              <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed font-sans">
                Operationalize mental models and tactical frameworks extracted directly from Lenny Rachitsky's podcast interviews with elite product leaders.
              </p>
            </div>

            {/* Curated Playbook Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
              {starterPlaybooks.map((card, i) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setInputText(card.prompt);
                      if (card.skill === 'ship30') setIsShip30Mode(true);
                    }}
                    className="group relative p-4 rounded-2xl glass-surface hover:glass-surface-elevated hover:border-emerald-500/40 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-glow-glass"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-200 font-heading">{card.guest}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5 font-mono">({card.role})</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-emerald-300 border border-white/[0.06] group-hover:border-emerald-500/30 transition-colors">
                        {card.badge}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold font-heading text-slate-100 group-hover:text-emerald-300 transition-colors mb-1 flex items-center justify-between">
                      <span>{card.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'} animate-in fade-in duration-150`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 mt-0.5 shadow-glow-emerald">
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed max-w-2xl space-y-3.5 transition-all ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 text-white rounded-tr-none shadow-glow-indigo font-medium'
                      : 'glass-surface-elevated text-slate-200 rounded-tl-none border border-white/[0.08]'
                  }`}
                >
                  {/* Assistant Telemetry Header */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Grounding Check Passed</span>
                      </span>
                      <span>
                        via {msg.provider_used || selectedProvider} ({msg.model_used || selectedModel})
                      </span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap leading-relaxed prose prose-invert prose-xs max-w-none font-sans">
                    {msg.content}
                  </div>

                  {/* Generated Artifact Action Banner */}
                  {msg.artifact && (
                    <div className="pt-2 border-t border-white/[0.06]">
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold font-heading text-slate-100">{msg.artifact.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">Interactive Studio Deliverable</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenArtifact(msg.artifact!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-obsidian-950 text-xs font-bold font-heading shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
                        >
                          <span>Open in Canvas</span>
                          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verified Citations Pills */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-emerald-400" />
                        <span>Verified Podcast Citations ({msg.citations.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCitation(c)}
                            className="px-2.5 py-1 rounded-lg glass-pill text-[10px] text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1.5"
                          >
                            <span className="font-bold font-heading text-emerald-400">{c.guest}</span>
                            <span className="text-slate-500">•</span>
                            <span className="truncate max-w-[140px] text-slate-400">{c.episode_title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Streaming & Loading State */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-2xl animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl glass-surface-elevated text-xs text-slate-300 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.3s]" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Synthesizing grounded facts via <strong className="text-slate-200">{selectedProvider}</strong> ({selectedModel})...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Citation Popover Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="glass-surface-elevated border border-white/[0.1] rounded-2xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Verified Podcast Excerpt
                </span>
                <h3 className="text-sm font-bold font-heading text-white mt-0.5">
                  {activeCitation.guest} — {activeCitation.episode_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors"
              >
                Close
              </button>
            </div>

            {activeCitation.section && (
              <div className="text-[11px] text-slate-400 font-mono">
                <span className="text-slate-500">Section:</span> {activeCitation.section}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-obsidian-950 border border-white/[0.06] text-xs text-slate-200 italic leading-relaxed font-sans">
              &ldquo;{activeCitation.snippet}&rdquo;
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
              <span>Similarity Confidence: {(activeCitation.score * 100).toFixed(1)}%</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Grounded Fact
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Island Command Bar */}
      <div className="p-4 bg-transparent shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          {/* Mode Pill Switcher Bar */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={() => setIsShip30Mode(!isShip30Mode)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-heading font-semibold transition-all border ${
                isShip30Mode
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-glow-emerald'
                  : 'glass-pill text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Ship 30 for 30 Essay Mode</span>
              {isShip30Mode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
              Press ↵ to send • ⇧+↵ for newline
            </span>
          </div>

          {/* Floating Command Island */}
          <div className="relative flex items-end glass-dock rounded-2xl p-1.5 border border-white/[0.08] focus-within:border-emerald-500/50 shadow-glow-glass transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isShip30Mode
                  ? "Prompt a Ship 30 for 30 atomic essay (e.g. 'Draft an essay on High Agency from Shreyas Doshi')..."
                  : "Ask about product strategy, PLG loops, retention benchmarks from Lenny's podcast..."
              }
              className="w-full bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-xl transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-obsidian-950 font-bold shadow-glow-emerald hover:opacity-95 active:scale-95'
                  : 'bg-white/[0.03] text-slate-600 cursor-not-allowed'
              }`}
              title="Send Request"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
