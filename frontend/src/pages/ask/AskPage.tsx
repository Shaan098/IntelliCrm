import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, RotateCcw, AlertCircle } from 'lucide-react';
import { useAsk } from '@/hooks/useAsk';
import { useAuth } from '@/hooks/useAuth';
import ThinkingLoader from '@/components/features/qa/ThinkingLoader';
import AnswerCard from '@/components/features/qa/AnswerCard';
import { cn, getRoleColor } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';
import { AskResponse } from '@/types/qa.types';

const SAMPLE_QUESTIONS = [
  'What authentication method does the system use?',
  'How are passwords secured in the database?',
  'What database does this system use?',
  'Who can manage users in the system?',
];

export default function AskPage() {
  const [question, setQuestion]   = useState('');
  const [lastQuestion, setLastQuestion] = useState('');
  const [history, setHistory]     = useState<AskResponse[]>([]);
  const { user } = useAuth();
  const { mutate, isPending, data, isError, error, reset } = useAsk();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || isPending) return;
    // Save previous answer to history before firing new query
    if (data) setHistory((prev) => [data, ...prev]);
    setLastQuestion(q);
    reset();
    mutate({ question: q });
  };

  const handleSample = (q: string) => {
    if (isPending) return;
    if (data) setHistory((prev) => [data, ...prev]);
    setQuestion(q);
    setLastQuestion(q);
    reset();
    mutate({ question: q });
  };

  const handleReset = () => {
    if (data) setHistory((prev) => [data, ...prev]);
    setQuestion('');
    setLastQuestion('');
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-ai mb-4 shadow-glow-accent">
          <Brain size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Ask <span className="gradient-text-ai">IntelliCRM</span>
        </h1>
        <p className="text-sm text-[#9090b0] max-w-sm mx-auto">
          Ask anything about your uploaded documents. Answers are grounded in retrieved content with page-level citations.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs text-[#5a5a78]">Signed in as</span>
          <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', getRoleColor(user?.role || ''))}>
            {user?.role}
          </span>
          <span className="text-xs text-[#5a5a78]">— role filters document access</span>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <div className={cn(
          'relative bg-[#111118] border rounded-xl overflow-hidden transition-all',
          isPending
            ? 'border-accent-500/40 ring-1 ring-accent-500/20'
            : 'border-[#2a2a3a] hover:border-[#3a3a50] focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20'
        )}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask a question about your documents… (Enter to submit, Shift+Enter for new line)"
            rows={3}
            disabled={isPending}
            aria-label="Question input"
            className="w-full px-4 pt-4 pb-14 bg-transparent text-sm text-white placeholder-[#5a5a78] resize-none focus:outline-none disabled:opacity-50"
          />

          {/* Bottom toolbar */}
          <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
            <span className="text-xs text-[#5a5a78]">
              {isPending
                ? '⏳ Waiting for LLM response…'
                : 'Enter to submit · Shift+Enter for newline'}
            </span>
            <div className="flex items-center gap-2">
              {(data || isError) && !isPending && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#9090b0] hover:text-white transition-colors"
                >
                  <RotateCcw size={12} /> Clear
                </button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!question.trim() || isPending}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-medium transition-all',
                  isPending
                    ? 'bg-accent-600/50 cursor-not-allowed'
                    : 'bg-gradient-brand hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-brand'
                )}
              >
                <Send size={12} />
                {isPending ? 'Thinking…' : 'Ask'}
              </motion.button>
            </div>
          </div>
        </div>
      </form>

      {/* Sample questions (only when idle) */}
      <AnimatePresence>
        {!data && !isPending && !isError && history.length === 0 && (
          <motion.div
            key="samples"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <p className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider mb-3">Try asking</p>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_QUESTIONS.map((q) => (
                <motion.button
                  key={q}
                  variants={staggerItem}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSample(q)}
                  className="text-left p-3 rounded-lg bg-[#111118] border border-[#2a2a3a] hover:border-brand-500/30 hover:bg-[#1a1a24] transition-all group"
                >
                  <p className="text-xs text-[#9090b0] group-hover:text-white transition-colors leading-snug">{q}</p>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active answer area */}
      <AnimatePresence mode="wait">
        {isPending && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {lastQuestion && (
              <div className="mb-4 flex items-start gap-2.5 px-1">
                <div className="w-5 h-5 rounded-full bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] text-[#9090b0]">Q</span>
                </div>
                <p className="text-sm text-[#9090b0] italic">"{lastQuestion}"</p>
              </div>
            )}
            <ThinkingLoader />
          </motion.div>
        )}

        {isError && !isPending && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300 mb-0.5">Request failed</p>
                <p className="text-xs text-red-400/80">{(error as Error)?.message || 'Something went wrong. Please try again.'}</p>
                <button
                  onClick={() => mutate({ question: lastQuestion })}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                >
                  Retry this question →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {data && !isPending && (
          <motion.div key="answer" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {lastQuestion && (
              <div className="mb-4 flex items-start gap-2.5 px-1">
                <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[9px] text-brand-400">Q</span>
                </div>
                <p className="text-sm text-white font-medium">"{lastQuestion}"</p>
              </div>
            )}
            <AnswerCard data={data} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Previous answers history */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-[#2a2a3a]" />
              <span className="text-xs text-[#5a5a78] uppercase tracking-wider">Previous answers</span>
              <div className="h-px flex-1 bg-[#2a2a3a]" />
            </div>
            <div className="space-y-6 opacity-60 hover:opacity-80 transition-opacity">
              {history.map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs text-[#5a5a78] italic pl-1">"{item.question}"</p>
                  <AnswerCard data={item} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
