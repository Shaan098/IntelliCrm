import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

export default function ThinkingLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Pulsing brain */}
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-ai/20 border border-accent-500/30 flex items-center justify-center"
        >
          <Brain size={28} className="text-accent-400" />
        </motion.div>
        {/* Ripple rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-2xl border border-accent-500/20"
            animate={{ scale: [1, 1.8, 1.8], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Thinking text */}
      <p className="text-sm font-medium text-white mb-2">Searching your documents</p>

      {/* Steps */}
      <div className="space-y-1.5 text-center">
        {[
          { label: 'Generating embeddings', delay: 0 },
          { label: 'Retrieving relevant chunks', delay: 0.8 },
          { label: 'Generating grounded answer', delay: 1.6 },
        ].map(({ label, delay }) => (
          <motion.p
            key={label}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay, ease: 'easeInOut' }}
            className="text-xs text-[#5a5a78]"
          >
            {label}
          </motion.p>
        ))}
      </div>

      {/* Dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-500 thinking-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      <p className="text-xs text-[#5a5a78] mt-4">LLM inference may take 20–60 seconds</p>
    </motion.div>
  );
}
