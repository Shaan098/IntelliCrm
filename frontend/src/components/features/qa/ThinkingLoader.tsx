import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock } from 'lucide-react';

const STEPS = [
  { label: 'Generating query embedding…',     threshold: 0  },
  { label: 'Running vector similarity search…', threshold: 5  },
  { label: 'Retrieving top document chunks…',  threshold: 12 },
  { label: 'Feeding context to llama3.1:8b…', threshold: 20 },
  { label: 'Generating grounded answer…',      threshold: 30 },
  { label: 'Almost there — LLM is writing…',   threshold: 60 },
];

function formatElapsed(secs: number): string {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export default function ThinkingLoader() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine which step to show based on elapsed time
  const currentStep = [...STEPS]
    .reverse()
    .find((s) => elapsed >= s.threshold) ?? STEPS[0];

  const isRunningLong = elapsed > 45;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      {/* Pulsing brain icon with ripple rings */}
      <div className="relative mb-6">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-ai/20 border border-accent-500/30 flex items-center justify-center"
        >
          <Brain size={28} className="text-accent-400" />
        </motion.div>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-2xl border border-accent-500/20"
            animate={{ scale: [1, 1.9, 1.9], opacity: [0.4, 0, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Live step label */}
      <motion.p
        key={currentStep.label}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-white mb-1 text-center"
      >
        {currentStep.label}
      </motion.p>

      {/* Elapsed timer */}
      <div className="flex items-center gap-1.5 text-xs text-[#5a5a78] mb-6">
        <Clock size={11} />
        <span className={isRunningLong ? 'text-yellow-400' : ''}>
          {formatElapsed(elapsed)} elapsed
        </span>
        {isRunningLong && (
          <span className="text-[#5a5a78]">— large model, please keep waiting</span>
        )}
      </div>

      {/* Bouncing dots */}
      <div className="flex gap-1.5 mb-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent-500 thinking-dot"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full bg-[#1a1a24] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-600 to-accent-400"
          animate={{ width: ['0%', '85%'] }}
          transition={{ duration: 90, ease: 'easeOut' }}
        />
      </div>

      {!isRunningLong && (
        <p className="text-xs text-[#5a5a78] mt-3">Typical response: 30–90 seconds</p>
      )}
    </motion.div>
  );
}
