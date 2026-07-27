import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, RotateCcw } from 'lucide-react';
import { useAsk } from '@/hooks/useAsk';
import { useAuth } from '@/hooks/useAuth';
import ThinkingLoader from '@/components/features/qa/ThinkingLoader';
import AnswerCard from '@/components/features/qa/AnswerCard';
import { cn, getRoleColor } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

const SAMPLE_QUESTIONS = [
  'What authentication method does the system use?',
  'How are passwords secured in the database?',
  'What database does this system use?',
  'Who can manage users in the system?',
];

export default function AskPage() {
  const [question, setQuestion] = useState('');
  const { user } = useAuth();
  const { mutate, isPending, data, isError, error, reset } = useAsk();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q || isPending) return;
    mutate({ question: q });
  };

  const handleSample = (q: string) => {
    setQuestion(q);
    mutate({ question: q });
  };

  const handleReset = () => {
    setQuestion('');
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-ai flex items-center justify-center shadow-glow-accent">
            <Brain size={20} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Ask <span className="gradient-text-ai">IntelliCRM</span>
        </h1>
        <p className="text-sm text-[#9090b0] max-w-md mx-auto">
          Ask any question about your company documents. Answers are grounded in retrieved content — with page-level citations.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs text-[#5a5a78]">You're signed in as</span>
          <span className={cn('inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border', getRoleColor(user?.role || ''))}>
            {user?.role}
          </span>
          <span className="text-xs text-[#5a5a78]">— role filters document access</span>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative bg-[#111118] border border-[#2a2a3a] rounded-xl hover:border-[#3a3a50] focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/20 transition-all overflow-hidden">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Ask a question about your documents… (Enter to submit)"
            rows={3}
            disabled={isPending}
            aria-label="Question input"
            className="w-full px-4 pt-4 pb-12 bg-transparent text-sm text-white placeholder-[#5a5a78] resize-none focus:outline-none disabled:opacity-50"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {(data || isError) && (
              <button
                type="button" onClick={handleReset}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#9090b0] hover:text-white transition-colors"
              >
                <RotateCcw size={12} /> New
              </button>
            )}
            <motion.button
              whileTap={{ scale: 0.95 }} type="submit"
              disabled={!question.trim() || isPending}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-brand text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-brand transition-all"
            >
              <Send size={12} />
              Ask
            </motion.button>
          </div>
        </div>
      </form>

      {/* Sample questions */}
      <AnimatePresence>
        {!data && !isPending && !isError && (
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

      {/* Answer area */}
      <AnimatePresence mode="wait">
        {isPending && <ThinkingLoader key="loading" />}
        {isError && !isPending && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {(error as Error)?.message || 'Something went wrong. Try again.'}
          </motion.div>
        )}
        {data && !isPending && <AnswerCard key="answer" data={data} />}
      </AnimatePresence>
    </div>
  );
}
