import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Check, Loader2, AlertCircle, FolderOpen } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { DocumentCategory } from '@/types/document.types';
import { cn, getCategoryColor } from '@/lib/utils';
import { fadeScaleVariants } from '@/animations/variants';
import { easeSmooth } from '@/animations/transitions';

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'hr',        label: 'HR' },
  { value: 'finance',   label: 'Finance' },
  { value: 'general',   label: 'General' },
];

export default function UploadZone() {
  const [dragOver, setDragOver]   = useState(false);
  const [file, setFile]           = useState<File | null>(null);
  const [title, setTitle]         = useState('');
  const [category, setCategory]   = useState<DocumentCategory>('general');
  const [progress, setProgress]   = useState(0);
  const inputRef                  = useRef<HTMLInputElement>(null);

  const { mutate, isPending, isSuccess, isError, error, reset } = useMutation({
    mutationFn: () =>
      documentService.upload(file!, title || file!.name, category, setProgress),
    onSuccess: () => {
      setTimeout(() => {
        setFile(null);
        setTitle('');
        setCategory('general');
        setProgress(0);
        reset();
      }, 3000);
    },
  });

  const handleFile = (f: File) => {
    if (!f.type.includes('pdf')) return;
    setFile(f);
    setTitle(f.name.replace('.pdf', ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    mutate();
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className={cn(
          'upload-zone relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
          dragOver ? 'drag-over border-brand-500 bg-brand-500/5' : 'border-[#2a2a3a] hover:border-[#3a3a50] bg-[#111118]',
          file && 'border-solid border-[#2a2a3a]'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
      >
        <input
          ref={inputRef} type="file" accept=".pdf" className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="w-14 h-14 rounded-2xl bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center mx-auto mb-4">
                <Upload size={24} className={cn('transition-colors', dragOver ? 'text-brand-400' : 'text-[#5a5a78]')} />
              </div>
              <p className="text-sm font-medium text-white mb-1">Drop your PDF here</p>
              <p className="text-xs text-[#9090b0]">or <span className="text-brand-400">click to browse</span></p>
              <p className="text-xs text-[#5a5a78] mt-2">PDF files only</p>
            </motion.div>
          ) : (
            <motion.div key="file" {...fadeScaleVariants} transition={easeSmooth} className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-brand-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-[#9090b0]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); reset(); }}
                className="ml-2 w-6 h-6 rounded-full bg-[#1a1a24] flex items-center justify-center text-[#5a5a78] hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Form */}
      <AnimatePresence>
        {file && !isSuccess && (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-[#9090b0] mb-1.5">Document title</label>
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this document"
                className="w-full px-3 py-2.5 bg-[#111118] border border-[#2a2a3a] rounded-lg text-sm text-white placeholder-[#5a5a78] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 hover:border-[#3a3a50] transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-[#9090b0] mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value} type="button"
                    onClick={() => setCategory(c.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                      category === c.value
                        ? getCategoryColor(c.value)
                        : 'bg-[#111118] border-[#2a2a3a] text-[#9090b0] hover:border-[#3a3a50] hover:text-white'
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {isPending && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#9090b0]">Uploading & processing…</span>
                  <span className="text-xs text-brand-400">{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1a1a24] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-brand"
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-[#5a5a78]">
                  <Loader2 size={11} className="animate-spin" />
                  Embedding chunks — this may take a while…
                </div>
              </div>
            )}

            {/* Error */}
            {isError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-400">{(error as Error).message}</p>
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.98 }} type="submit" disabled={isPending}
              className="w-full py-2.5 rounded-lg bg-gradient-brand text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-brand flex items-center justify-center gap-2 transition-all"
            >
              {isPending ? <><Loader2 size={15} className="animate-spin" />Processing PDF…</> : <><Upload size={15} />Upload Document</>}
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
              <Check size={24} className="text-green-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">Document uploaded successfully!</p>
            <p className="text-xs text-[#9090b0]">All chunks have been embedded and stored.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
