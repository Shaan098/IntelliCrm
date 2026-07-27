import { motion } from 'framer-motion';
import { Brain, FileText, Info } from 'lucide-react';
import { AskResponse } from '@/types/qa.types';
import { cn, formatSimilarity, getSimilarityColor } from '@/lib/utils';
import { answerRevealVariants, staggerContainer, sourceBadgeVariants } from '@/animations/variants';
import { easeGentle } from '@/animations/transitions';

interface AnswerCardProps {
  data: AskResponse;
}

export default function AnswerCard({ data }: AnswerCardProps) {
  const refused = data.sources.length === 0;

  return (
    <motion.div
      variants={answerRevealVariants}
      initial="initial"
      animate="animate"
      transition={easeGentle}
      className="space-y-4"
    >
      {/* Answer bubble */}
      <div className={cn(
        'rounded-xl border p-5',
        refused
          ? 'bg-yellow-500/5 border-yellow-500/20'
          : 'bg-[#111118] border-[#2a2a3a]'
      )}>
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
            refused ? 'bg-yellow-500/10' : 'bg-gradient-ai'
          )}>
            {refused ? <Info size={14} className="text-yellow-400" /> : <Brain size={14} className="text-white" />}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#9090b0]">
            {refused ? 'Insufficient context' : 'AI Answer'}
          </span>
          {!refused && (
            <span className="text-xs text-[#5a5a78]">
              · Top relevance: <span className={getSimilarityColor(data.topScore)}>{formatSimilarity(data.topScore)}</span>
            </span>
          )}
        </div>

        <div className="prose-ai">
          <p className={cn('text-sm leading-relaxed', refused ? 'text-yellow-200/80' : 'text-[#f0f0ff]')}>
            {data.answer}
          </p>
        </div>
      </div>

      {/* Sources */}
      {data.sources.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={13} className="text-[#5a5a78]" />
            <span className="text-xs font-medium text-[#5a5a78] uppercase tracking-wider">
              Sources cited ({data.sources.length})
            </span>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex flex-wrap gap-2"
          >
            {data.sources.map((src, i) => (
              <motion.div
                key={i}
                variants={sourceBadgeVariants}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] hover:border-accent-500/30 transition-colors"
              >
                <div className="w-5 h-5 rounded flex items-center justify-center bg-accent-500/10 flex-shrink-0">
                  <span className="text-[9px] font-bold text-accent-400">{i + 1}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-white leading-tight">{src.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {src.page && <span className="text-[10px] text-[#5a5a78]">Page {src.page}</span>}
                    <span className="text-[10px] text-[#5a5a78]">·</span>
                    <span className={cn('text-[10px] font-mono font-medium', getSimilarityColor(src.similarity))}>
                      {formatSimilarity(src.similarity)} match
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
