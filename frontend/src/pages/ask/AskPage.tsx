import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import {
  Brain, Send, User, FileText, ChevronDown,
  AlertCircle, Trash2, Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
import { qaService } from '@/services/qa.service';
import { AskResponse } from '@/types/qa.types';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatSimilarity, getSimilarityColor } from '@/lib/utils';

// ── Message types ─────────────────────────────────────
type ChatMsg =
  | { kind: 'user';     id: string; text: string;       ts: Date }
  | { kind: 'thinking'; id: string;                      ts: Date }
  | { kind: 'ai';       id: string; data: AskResponse;  ts: Date }
  | { kind: 'error';    id: string; msg: string; retry: () => void; ts: Date };

// ── Sample questions ──────────────────────────────────
const SAMPLES = [
  'What authentication method does the system use?',
  'How are passwords secured in the database?',
  'What database does this system use?',
  'Who can manage users in the system?',
];

// ── Thinking bubble (with live elapsed timer) ─────────
function ThinkingBubble() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const stepLabel =
    elapsed > 60 ? 'Almost done — writing answer…' :
    elapsed > 30 ? 'Generating answer with llama3.1:8b…' :
    elapsed > 12 ? 'Retrieving document chunks…' :
    elapsed > 5  ? 'Running vector search…' :
                   'Generating query embedding…';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2.5"
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-ai flex items-center justify-center flex-shrink-0 shadow-glow-accent">
        <Brain size={13} className="text-white" />
      </div>

      {/* Bubble */}
      <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl rounded-bl-sm px-4 py-3 max-w-xs">
        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent-400 thinking-dot"
                style={{ animationDelay: `${i * 0.16}s` }}
              />
            ))}
          </div>
          {/* Live timer */}
          {elapsed > 0 && (
            <span className={cn(
              'text-xs tabular-nums font-mono',
              elapsed > 45 ? 'text-yellow-400' : 'text-[#5a5a78]'
            )}>
              {elapsed}s
            </span>
          )}
        </div>
        {elapsed > 5 && (
          <motion.p
            key={stepLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-[#5a5a78] mt-1.5 leading-snug"
          >
            {stepLabel}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}

// ── AI response bubble ────────────────────────────────
function AIBubble({ data, ts }: { data: AskResponse; ts: Date }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2.5"
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-ai flex items-center justify-center flex-shrink-0 shadow-glow-accent">
        <Brain size={13} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        {/* Message card */}
        <div className="bg-[#111118] border border-[#2a2a3a] rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%]">
          <p className="text-sm text-[#f0f0ff] leading-relaxed whitespace-pre-wrap">
            {data.answer}
          </p>

          {/* Sources toggle */}
          {data.sources.length > 0 && (
            <button
              onClick={() => setOpen(v => !v)}
              className="mt-3 flex items-center gap-1.5 text-xs text-[#5a5a78] hover:text-accent-400 transition-colors"
            >
              <FileText size={11} />
              {data.sources.length} source{data.sources.length > 1 ? 's' : ''} cited
              <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
            </button>
          )}

          {/* Sources list */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {data.sources.map((src, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#0f0f16] border border-[#2a2a3a]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] font-bold text-accent-400 bg-accent-500/10 rounded px-1 flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-xs text-white truncate">{src.title}</span>
                        {src.page && (
                          <span className="text-[10px] text-[#5a5a78] flex-shrink-0">p.{src.page}</span>
                        )}
                      </div>
                      <span className={cn('text-[10px] font-mono flex-shrink-0 ml-2', getSimilarityColor(src.similarity))}>
                        {formatSimilarity(src.similarity)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-[10px] text-[#5a5a78] mt-1 ml-1">
          IntelliCRM · {format(ts, 'h:mm a')}
        </p>
      </div>
    </motion.div>
  );
}

// ── User message bubble ───────────────────────────────
function UserBubble({ text, ts }: { text: string; ts: Date }) {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end justify-end gap-2.5"
    >
      <div className="flex-1 min-w-0 flex flex-col items-end">
        <div className="bg-brand-600/20 border border-brand-500/30 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
          <p className="text-sm text-white leading-relaxed">{text}</p>
        </div>
        <p className="text-[10px] text-[#5a5a78] mt-1 mr-1">
          {user?.name?.split(' ')[0]} · {format(ts, 'h:mm a')}
        </p>
      </div>
      <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0 text-white text-[10px] font-semibold">
        {initials}
      </div>
    </motion.div>
  );
}

// ── Error bubble ──────────────────────────────────────
function ErrorBubble({ msg, retry, ts }: { msg: string; retry: () => void; ts: Date }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/20 flex items-center justify-center flex-shrink-0">
        <AlertCircle size={13} className="text-red-400" />
      </div>
      <div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl rounded-bl-sm px-4 py-3">
          <p className="text-sm text-red-300">{msg}</p>
          <button
            onClick={retry}
            className="mt-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
          >
            Retry →
          </button>
        </div>
        <p className="text-[10px] text-[#5a5a78] mt-1 ml-1">{format(ts, 'h:mm a')}</p>
      </div>
    </motion.div>
  );
}

// ── Welcome empty state ───────────────────────────────
function Welcome({ onSample }: { onSample: (q: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full py-12 px-4 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-glow-accent mb-5">
        <Sparkles size={24} className="text-white" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-1">Ask IntelliCRM</h2>
      <p className="text-sm text-[#9090b0] max-w-xs mb-8">
        Ask anything about your uploaded documents. I'll search them and give you a grounded, cited answer.
      </p>

      <div className="w-full max-w-sm space-y-2">
        <p className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider mb-3">Try asking</p>
        {SAMPLES.map(q => (
          <motion.button
            key={q}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSample(q)}
            className="w-full text-left px-4 py-2.5 rounded-xl bg-[#111118] border border-[#2a2a3a] hover:border-brand-500/30 hover:bg-[#1a1a24] transition-all group"
          >
            <p className="text-xs text-[#9090b0] group-hover:text-white transition-colors">{q}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main ChatPage ─────────────────────────────────────
export default function AskPage() {
  const [messages, setMessages]   = useState<ChatMsg[]>([]);
  const [input, setInput]         = useState('');
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const { mutate, isPending } = useMutation({
    mutationFn: qaService.ask,
  });

  const send = (text: string) => {
    const q = text.trim();
    if (!q || isPending) return;

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userId     = crypto.randomUUID();
    const thinkingId = crypto.randomUUID();

    // Add user bubble + thinking bubble immediately
    setMessages(prev => [
      ...prev,
      { kind: 'user',     id: userId,     text: q,  ts: new Date() },
      { kind: 'thinking', id: thinkingId,             ts: new Date() },
    ]);

    mutate(
      { question: q },
      {
        onSuccess: (data) => {
          setMessages(prev => [
            ...prev.filter(m => m.id !== thinkingId),
            { kind: 'ai', id: crypto.randomUUID(), data, ts: new Date() },
          ]);
        },
        onError: (err) => {
          setMessages(prev => [
            ...prev.filter(m => m.id !== thinkingId),
            {
              kind: 'error',
              id: crypto.randomUUID(),
              msg: (err as Error).message,
              retry: () => send(q),
              ts: new Date(),
            },
          ]);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const adjustHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-ai flex items-center justify-center shadow-glow-accent">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white leading-tight">IntelliCRM Chat</h1>
            <p className="text-xs text-[#5a5a78]">RAG-powered · llama3.1:8b</p>
          </div>
        </div>
        {messages.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={clearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111118] border border-[#2a2a3a] text-xs text-[#9090b0] hover:text-white hover:border-[#3a3a50] transition-colors"
          >
            <Trash2 size={12} />
            Clear chat
          </motion.button>
        )}
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-4 space-y-5 min-h-0">
        {messages.length === 0 ? (
          <Welcome onSample={(q) => send(q)} />
        ) : (
          <>
            {messages.map(msg => {
              if (msg.kind === 'user')     return <UserBubble     key={msg.id} text={msg.text}                ts={msg.ts} />;
              if (msg.kind === 'thinking') return <ThinkingBubble key={msg.id} />;
              if (msg.kind === 'ai')       return <AIBubble       key={msg.id} data={msg.data}               ts={msg.ts} />;
              if (msg.kind === 'error')    return <ErrorBubble    key={msg.id} msg={msg.msg} retry={msg.retry} ts={msg.ts} />;
              return null;
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ── Input bar ── */}
      <div className="pt-3 flex-shrink-0">
        <div className={cn(
          'flex items-end gap-2 p-2 rounded-xl border bg-[#111118] transition-all',
          isPending
            ? 'border-accent-500/30 ring-1 ring-accent-500/10'
            : 'border-[#2a2a3a] focus-within:border-brand-500/50 focus-within:ring-1 focus-within:ring-brand-500/10'
        )}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={handleKeyDown}
            placeholder={isPending ? 'Waiting for response…' : 'Ask a question… (Enter to send)'}
            disabled={isPending}
            rows={1}
            aria-label="Chat input"
            className="flex-1 bg-transparent text-sm text-white placeholder-[#5a5a78] resize-none focus:outline-none px-2 py-1.5 disabled:opacity-40 max-h-40"
            style={{ height: 'auto' }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            disabled={!input.trim() || isPending}
            aria-label="Send message"
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
              input.trim() && !isPending
                ? 'bg-gradient-brand text-white shadow-brand hover:opacity-90'
                : 'bg-[#1a1a24] text-[#5a5a78] cursor-not-allowed'
            )}
          >
            <Send size={14} />
          </motion.button>
        </div>
        <p className="text-[10px] text-[#5a5a78] text-center mt-2">
          Shift+Enter for new line · Answers grounded in your uploaded documents
        </p>
      </div>
    </div>
  );
}
