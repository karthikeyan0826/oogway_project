import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, BookOpen, ExternalLink, PenTool, 
  CheckCircle, ArrowUpRight, Flame, Compass, Zap, Sparkles, FileText
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
    <div className="h-full flex flex-col bg-white relative overflow-hidden font-sans">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 md:px-10 py-8 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto mt-6 space-y-8">
            {/* Editorial Welcome Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500" />
                <span>Podcast Knowledge Base</span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-600">Strictly Grounded</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold font-serif tracking-tight text-stone-900">
                The Lenny Growth Assistant
              </h1>

              <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                Strategic frameworks, mental models, and tactical execution advice extracted directly from Lenny Rachitsky&apos;s interviews with top product leaders.
              </p>
            </div>

            {/* Curated Playbook Cards */}
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
                    className="group p-4 rounded-xl bg-white border border-stone-200 hover:border-stone-400 hover:shadow-card cursor-pointer transition-all duration-150"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-xs font-medium text-stone-900">{card.guest}</span>
                          <span className="text-[10px] text-stone-400 ml-1.5 font-mono">({card.role})</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {card.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold font-serif text-stone-900 group-hover:text-stone-700 transition-colors mb-1 flex items-center justify-between">
                      <span>{card.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-stone-700" />
                    </h4>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
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
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-stone-900 border border-stone-800 text-stone-100 flex items-center justify-center shrink-0 mt-0.5 font-serif font-semibold text-xs shadow-xs">
                    L
                  </div>
                )}

                <div
                  className={`rounded-xl p-4 text-xs leading-relaxed max-w-2xl space-y-3 ${
                    isUser
                      ? 'bg-stone-100 border border-stone-200/90 text-stone-900 rounded-tr-xs shadow-xs font-normal'
                      : 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-xs shadow-subtle'
                  }`}
                >
                  {/* Assistant Source Header */}
                  {!isUser && (
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 text-[10px] text-stone-400 font-mono">
                      <span className="flex items-center gap-1.5 text-stone-600 font-medium">
                        <CheckCircle className="w-3 h-3 text-stone-500" />
                        <span>Grounded in Transcripts</span>
                      </span>
                      <span>
                        via {msg.provider_used || selectedProvider} ({msg.model_used || selectedModel})
                      </span>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="whitespace-pre-wrap leading-relaxed prose prose-stone prose-xs max-w-none font-sans text-stone-800">
                    {msg.content}
                  </div>

                  {/* Generated Artifact Action Banner */}
                  {msg.artifact && (
                    <div className="pt-2 border-t border-stone-100">
                      <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-stone-200 flex items-center justify-center text-stone-700">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold font-serif text-stone-900">{msg.artifact.title}</div>
                            <div className="text-[10px] text-stone-400 font-mono">Interactive Deliverable</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenArtifact(msg.artifact!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium shadow-xs transition-colors"
                        >
                          <span>Open in Canvas</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verified Citations List */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-stone-500" />
                        <span>Verified Citations ({msg.citations.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCitation(c)}
                            className="px-2.5 py-1 rounded-md bg-stone-50 hover:bg-stone-100 border border-stone-200 hover:border-stone-300 text-[10px] text-stone-700 hover:text-stone-900 transition-colors flex items-center gap-1.5 font-mono"
                          >
                            <span className="font-semibold text-stone-900">{c.guest}</span>
                            <span className="text-stone-300">•</span>
                            <span className="truncate max-w-[150px] text-stone-500">{c.episode_title}</span>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-2xl">
            <div className="w-7 h-7 rounded-lg bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center shrink-0 font-serif font-semibold text-xs">
              L
            </div>
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-stone-500 animate-bounce [animation-delay:0.3s]" />
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                Grounding with podcast transcripts via {selectedProvider} ({selectedModel})...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Citation Popover Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-stone-200 rounded-xl max-w-lg w-full p-5 space-y-3.5 shadow-elevated">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-wider">
                  Podcast Source Grounding
                </span>
                <h3 className="text-sm font-semibold font-serif text-stone-900 mt-0.5">
                  {activeCitation.guest} — {activeCitation.episode_title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="text-xs px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              >
                Close
              </button>
            </div>

            {activeCitation.section && (
              <div className="text-[11px] text-stone-500 font-mono">
                <span className="text-stone-400">Section:</span> {activeCitation.section}
              </div>
            )}

            <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700 italic leading-relaxed font-serif">
              &ldquo;{activeCitation.snippet}&rdquo;
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-mono">
              <span>Similarity Confidence: {(activeCitation.score * 100).toFixed(1)}%</span>
              <span className="text-stone-700 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-stone-500" /> Grounded in Corpus
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Command Input Bar */}
      <div className="p-4 bg-white border-t border-stone-200 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          {/* Mode Pill Bar */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => setIsShip30Mode(!isShip30Mode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors border ${
                isShip30Mode
                  ? 'bg-stone-900 border-stone-900 text-white font-medium'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Ship 30 for 30 Essay Mode</span>
              {isShip30Mode && <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />}
            </button>

            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">
              Enter to send • Shift+Enter for newline
            </span>
          </div>

          {/* Clean White Dock */}
          <div className="relative flex items-end bg-white rounded-xl p-1.5 border border-stone-300 focus-within:border-stone-800 focus-within:ring-1 focus-within:ring-stone-800 shadow-xs transition-all">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isShip30Mode
                  ? "Prompt a Ship 30 for 30 atomic essay (e.g. 'Draft an essay on High Agency from Shreyas Doshi')..."
                  : "Ask about product strategy, growth loops, retention metrics from Lenny's podcast..."
              }
              className="w-full bg-transparent px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none resize-none leading-relaxed font-sans"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 rounded-lg transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-400 cursor-not-allowed'
              }`}
              title="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
