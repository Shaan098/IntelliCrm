import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, ExternalLink, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useDraftEmail } from '@/hooks/useDraftEmail';
import { EmailDraftResponse } from '@/types/qa.types';
import { cn, formatSimilarity, getSimilarityColor } from '@/lib/utils';
import { fadeScaleVariants, backdropVariants } from '@/animations/variants';
import { modalTransition, easeGentle } from '@/animations/transitions';

interface EmailDraftModalProps {
  ticketId: string;
  ticketSubject: string;
  onClose: () => void;
}

function DraftContent({ data }: { data: EmailDraftResponse }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(data.draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Context badge */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium',
        data.usedPolicyContext
          ? 'bg-accent-500/10 border-accent-500/20 text-accent-400'
          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
      )}>
        {data.usedPolicyContext ? (
          <><FileText size={13} /> Policy context used — draft includes relevant guidelines</>
        ) : (
          <><AlertCircle size={13} /> No matching policy found — general response drafted</>
        )}
      </div>

      {/* Draft */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#9090b0] uppercase tracking-wider">Email Draft</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#9090b0] hover:text-white hover:border-[#3a3a50] transition-colors"
          >
            {copied ? <><Check size={12} className="text-green-400" />Copied!</> : <><Copy size={12} />Copy</>}
          </button>
        </div>
        <div className="p-4 bg-[#0f0f16] rounded-lg border border-[#2a2a3a] max-h-80 overflow-y-auto">
          <pre className="text-sm text-[#f0f0ff] whitespace-pre-wrap font-sans leading-relaxed">
            {data.draft}
          </pre>
        </div>
      </div>

      {/* Sources */}
      {data.sources.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider mb-2">Policy Sources Used</p>
          <div className="space-y-1.5">
            {data.sources.map((src, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
                <div className="flex items-center gap-2">
                  <FileText size={13} className="text-accent-400 flex-shrink-0" />
                  <span className="text-xs text-white">{src.title}</span>
                  {src.page && <span className="text-xs text-[#5a5a78]">· Page {src.page}</span>}
                </div>
                <span className={cn('text-xs font-mono font-medium', getSimilarityColor(src.similarity))}>
                  {formatSimilarity(src.similarity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailDraftModal({ ticketId, ticketSubject, onClose }: EmailDraftModalProps) {
  const { mutate, isPending, data, isError, error } = useDraftEmail(ticketId);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        initial="initial" animate="animate" exit="exit"
        transition={modalTransition}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        variants={fadeScaleVariants}
        initial="initial" animate="animate" exit="exit"
        transition={easeGentle}
        className="fixed inset-x-4 top-8 bottom-8 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-16 sm:w-full sm:max-w-2xl z-50 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Draft email"
      >
        <div className="flex flex-col h-full bg-[#111118] rounded-2xl border border-[#2a2a3a] shadow-card-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a3a]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-ai flex items-center justify-center">
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">AI Email Draft</h2>
                <p className="text-xs text-[#9090b0] truncate max-w-xs">{ticketSubject}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#5a5a78] hover:text-white hover:bg-[#1a1a24] transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {!data && !isPending && !isError && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-ai/10 border border-accent-500/20 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-accent-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Generate AI Draft</h3>
                <p className="text-sm text-[#9090b0] max-w-xs mb-6">
                  The AI will retrieve relevant policy documents and craft a professional, grounded reply.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => mutate()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-ai text-white text-sm font-medium shadow-glow-accent hover:opacity-90 transition-opacity"
                >
                  <Sparkles size={15} />
                  Generate Draft
                </motion.button>
              </div>
            )}

            {isPending && (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="flex gap-2 mb-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-accent-500 thinking-dot" />
                  ))}
                </div>
                <p className="text-sm font-medium text-white mb-1">Generating email draft</p>
                <p className="text-xs text-[#9090b0]">Retrieving policy context and drafting reply…</p>
                <div className="flex items-center gap-1.5 mt-4 text-xs text-[#5a5a78]">
                  <Loader2 size={12} className="animate-spin" />
                  This may take 20–60 seconds
                </div>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
                  <AlertCircle className="text-red-400" size={20} />
                </div>
                <p className="text-sm font-medium text-white mb-1">Failed to generate draft</p>
                <p className="text-xs text-[#9090b0] mb-4">{(error as Error)?.message}</p>
                <button
                  onClick={() => mutate()}
                  className="px-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-xs text-[#9090b0] hover:text-white transition-colors"
                >
                  Try again
                </button>
              </div>
            )}

            {data && <DraftContent data={data} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
