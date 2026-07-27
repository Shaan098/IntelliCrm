import { motion } from 'framer-motion';
import { FileText, Upload } from 'lucide-react';
import UploadZone from '@/components/features/documents/UploadZone';
import { staggerContainer, staggerItem } from '@/animations/variants';

export default function DocumentsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={18} className="text-brand-400" />
          <h1 className="text-xl font-bold text-white">Documents</h1>
        </div>
        <p className="text-sm text-[#9090b0]">
          Upload PDF documents. They'll be parsed, chunked, and embedded for RAG-powered Q&amp;A.
        </p>
      </div>

      {/* Upload card */}
      <motion.div
        variants={staggerContainer} initial="initial" animate="animate"
        className="bg-[#111118] rounded-xl border border-[#2a2a3a] p-6 space-y-6"
      >
        <motion.div variants={staggerItem} className="flex items-center gap-2">
          <Upload size={14} className="text-brand-400" />
          <h2 className="text-sm font-semibold text-white">Upload PDF</h2>
        </motion.div>

        <motion.div variants={staggerItem}>
          <UploadZone />
        </motion.div>
      </motion.div>

      {/* Info box */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/10"
      >
        <h3 className="text-xs font-semibold text-brand-400 mb-2 uppercase tracking-wider">How it works</h3>
        <ol className="space-y-1.5 text-xs text-[#9090b0] list-decimal list-inside">
          <li>PDF is parsed and split into pages using page markers</li>
          <li>Each page is chunked into 1000-char segments with 150-char overlap</li>
          <li>Chunks are embedded via Ollama (nomic-embed-text, 768-dim)</li>
          <li>Embeddings stored as pgvector in PostgreSQL</li>
          <li>At query time, cosine similarity retrieves relevant chunks by role</li>
        </ol>
      </motion.div>
    </div>
  );
}
