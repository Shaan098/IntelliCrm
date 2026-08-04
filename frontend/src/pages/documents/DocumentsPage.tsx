import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Search, Hash, Layers, Calendar, Trash2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import UploadZone from '@/components/features/documents/UploadZone';
import { CategoryBadge } from '@/components/shared/Badge';
import { EmptyState, ErrorState } from '@/components/shared/States';
import { TableSkeleton } from '@/components/shared/Skeleton';
import { formatDate } from '@/lib/utils';
import { staggerContainer, staggerItem } from '@/animations/variants';

export default function DocumentsPage() {
  const { data: docs, isLoading, isError, refetch } = useDocuments();
  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = docs?.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-0.5">Documents</h1>
          <p className="text-sm text-[#9090b0]">
            Upload and manage PDFs embedded into the vector knowledge base.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowUpload(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-brand text-white text-sm font-medium hover:opacity-90 shadow-brand transition-all"
        >
          <Upload size={14} />
          {showUpload ? 'Hide Upload' : 'Upload PDF'}
        </motion.button>
      </div>

      {/* Upload panel */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Upload size={14} className="text-brand-400" />
                <h2 className="text-sm font-semibold text-white">Upload New Document</h2>
              </div>
              <UploadZone onSuccess={() => { refetch(); setShowUpload(false); }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Library */}
      <div className="bg-[#111118] rounded-xl border border-[#2a2a3a] overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2a3a]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={13} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full pl-8 pr-3 py-2 bg-[#0f0f16] border border-[#2a2a3a] rounded-lg text-sm text-white placeholder-[#5a5a78] focus:outline-none focus:border-brand-500/50 transition-colors"
            />
          </div>
          {docs && (
            <span className="text-xs text-[#5a5a78] whitespace-nowrap">
              {filtered.length} / {docs.length} docs
            </span>
          )}
        </div>

        {/* Table header */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="hidden sm:grid grid-cols-[2fr_120px_80px_120px] gap-4 px-4 py-2.5 bg-[#0f0f16] border-b border-[#2a2a3a] text-xs font-medium text-[#5a5a78] uppercase tracking-wider">
            <span>Document</span>
            <span>Category</span>
            <span>Chunks</span>
            <span>Uploaded</span>
          </div>
        )}

        {/* States */}
        {isLoading && <TableSkeleton rows={4} />}
        {isError && (
          <ErrorState
            title="Failed to load documents"
            message="Could not reach the backend."
            onRetry={refetch}
            className="py-12"
          />
        )}
        {!isLoading && !isError && filtered.length === 0 && !search && (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload a PDF above to start embedding content into the knowledge base."
            className="py-12"
          />
        )}
        {!isLoading && !isError && filtered.length === 0 && search && (
          <div className="py-10 text-center text-sm text-[#5a5a78]">
            No documents match "<span className="text-white">{search}</span>"
          </div>
        )}

        {/* Rows */}
        {!isLoading && !isError && filtered.length > 0 && (
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {filtered.map(doc => (
              <motion.div
                key={doc.id}
                variants={staggerItem}
                className="grid grid-cols-1 sm:grid-cols-[2fr_120px_80px_120px] gap-2 sm:gap-4 px-4 py-4 border-b border-[#2a2a3a] last:border-0 hover:bg-[#161622] transition-colors"
              >
                {/* Title */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-brand-400" />
                  </div>
                  <p className="text-sm font-medium text-white truncate">{doc.title}</p>
                </div>

                {/* Category */}
                <div className="flex items-center">
                  <CategoryBadge category={doc.category} />
                </div>

                {/* Chunks */}
                <div className="flex items-center gap-1.5">
                  <Layers size={12} className="text-accent-400" />
                  <span className="text-sm text-[#9090b0] tabular-nums">{doc._count.chunks}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-xs text-[#9090b0]">
                  <Calendar size={11} />
                  {formatDate(doc.createdAt)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Info box */}
      <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10">
        <h3 className="text-xs font-semibold text-brand-400 mb-2 uppercase tracking-wider">RAG Pipeline</h3>
        <ol className="space-y-1 text-xs text-[#9090b0] list-decimal list-inside">
          <li>PDF parsed and split into pages</li>
          <li>Pages chunked (1000 chars, 150 overlap)</li>
          <li>Chunks embedded via <code className="text-brand-300">nomic-embed-text</code> (768-dim)</li>
          <li>Stored as <code className="text-brand-300">pgvector</code> in PostgreSQL</li>
          <li>Cosine similarity retrieval filtered by user role at query time</li>
        </ol>
      </div>
    </div>
  );
}
