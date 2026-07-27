import { motion } from 'framer-motion';
import { fadeScaleVariants } from '@/animations/variants';
import { easeGentle } from '@/animations/transitions';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      {/* Radial glow background */}
      <div className="absolute inset-0 bg-gradient-radial-brand pointer-events-none" />

      {/* Animated orbs */}
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none"
        style={{ animationDelay: '1.5s' }} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#7c5cfc 1px, transparent 1px), linear-gradient(to right, #7c5cfc 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Card */}
      <motion.div
        variants={fadeScaleVariants}
        initial="initial"
        animate="animate"
        transition={easeGentle}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              Intelli<span className="gradient-text">CRM</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-2xl border border-[#2a2a3a] shadow-card-lg p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#5a5a78] mt-6">
          RAG-Powered Document Intelligence Platform
        </p>
      </motion.div>
    </div>
  );
}
