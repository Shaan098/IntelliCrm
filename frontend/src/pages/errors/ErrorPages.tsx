import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldOff, ArrowLeft, Home } from 'lucide-react';
import { fadeScaleVariants } from '@/animations/variants';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <motion.div
        variants={fadeScaleVariants} initial="initial" animate="animate"
        className="text-center px-6"
      >
        <p className="text-8xl font-black text-[#1a1a24] mb-6">404</p>
        <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-sm text-[#9090b0] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-brand text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-brand">
          <Home size={14} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <motion.div
        variants={fadeScaleVariants} initial="initial" animate="animate"
        className="text-center px-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="text-red-400" size={28} />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-sm text-[#9090b0] mb-8 max-w-xs mx-auto">
          You don't have permission to view this page. Admin role required.
        </p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-white text-sm hover:border-[#3a3a50] transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
