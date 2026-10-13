import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, ExternalLink, Radio, PenTool, CheckCircle } from 'lucide-react';
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

  const starterPrompts = [
    {
      title: 'High Agency Playbook',
      guest: 'Shreyas Doshi',
      prompt: 'Draft a Ship 30 for 30 essay on Shreyas Doshi\'s High Agency framework and LNO time management.',
      skill: 'ship30',
    },
    {
      title: 'Four Growth Fits',
      guest: 'Brian Balfour',
      prompt: 'Explain Brian Balfour\'s Four Growth Fits framework and why compounding loops beat linear funnels.',
      skill: undefined,
    },
    {
      title: 'B2B PLG & Sales Timing',
      guest: 'Elena Verna',
      prompt: 'What are Elena Verna\'s rules for Product Qualified Leads (PQLs) and when should sales engage with users?',
      skill: undefined,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0b0f19] relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Strict Grounding Knowledge Copilot</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                The Lenny Growth Assistant
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Direct insights from Lenny Rachitsky's podcast interviews with Shreyas Doshi, Elena Verna, and Brian Balfour. Backed by verified citations.
              </p>
            </div>

            {/* Prompt Starter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {starterPrompts.map((card, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setInputText(card.prompt);
                    if (card.skill === 'ship30') setIsShip30Mode(true);
                  }}
                  className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-950/20 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400 mb-1">
                    <span>{card.guest}</span>
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1.5">{card.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {card.prompt}
                  </p>
                </div>
              ))}
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
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed max-w-2xl space-y-3 ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-950/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed prose prose-invert prose-xs max-w-none">
                    {msg.content}
                  </div>

                  {/* Artifact Button Pill if attached */}
                  {msg.artifact && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => onOpenArtifact(msg.artifact!)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-medium transition-colors text-[11px]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Artifact: {msg.artifact.title}</span>
                        <ExternalLink className="w-3 h-3 text-emerald-400 ml-0.5" />
                      </button>
                    </div>
                  )}

                  {/* Verified Citations List */}
                  {!isUser && msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/60">
                      <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-emerald-400" />
                        <span>Verified Citations ({msg.citations.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveCitation(c)}
                            className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-300 transition-colors flex items-center gap-1"
                          >
                            <span className="font-semibold text-emerald-400">[{c.guest}]</span>
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

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-2xl">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Grounding with transcripts via {selectedProvider} ({selectedModel})...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Citation Popover Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  Transcript Grounding Citation
                </h3>
                <p className="text-sm font-semibold text-white">
                  {activeCitation.guest} — {activeCitation.episode_title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>
            {activeCitation.section && (
              <div className="text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Section:</span> {activeCitation.section}
              </div>
            )}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 italic leading-relaxed">
              &ldquo;{activeCitation.snippet}&rdquo;
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Similarity Score: {(activeCitation.score * 100).toFixed(1)}%</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Grounded in Lenny's Podcast
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Prompt Bar */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          {/* Mode Controls Bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <button
              type="button"
              onClick={() => setIsShip30Mode(!isShip30Mode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                isShip30Mode
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              <PenTool className="w-3 h-3" />
              <span>Ship 30 Essay Mode</span>
              {isShip30Mode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>

            <span className="text-[10px] text-slate-500 font-mono">
              Press Enter to send, Shift+Enter for newline
            </span>
          </div>

          {/* Text Area & Action */}
          <div className="relative flex items-end bg-slate-900 border border-slate-800 focus-within:border-emerald-500/60 rounded-xl overflow-hidden shadow-inner transition-colors">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isShip30Mode
                  ? "Prompt a Ship 30 for 30 atomic essay (e.g. 'Synthesize High Agency from Shreyas')..."
                  : "Ask about product strategy, growth loops, PLG metrics..."
              }
              className="w-full bg-transparent px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`p-2.5 m-1.5 rounded-lg transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="Send Prompt"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
