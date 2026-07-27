import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { shakeVariants } from '@/animations/variants';

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ token, user }) => {
      login(user, token);
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <motion.div
      animate={isError ? 'shake' : undefined}
      variants={shakeVariants}
    >
      <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
      <p className="text-sm text-[#9090b0] mb-7">Sign in to your IntelliCRM account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-[#9090b0] mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={15} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={cn(
                'w-full pl-9 pr-4 py-2.5 bg-[#1a1a24] border rounded-lg text-sm text-white placeholder-[#5a5a78] transition-colors',
                'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                errors.email ? 'border-red-500/60' : 'border-[#2a2a3a] hover:border-[#3a3a50]'
              )}
              placeholder="you@company.com"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium text-[#9090b0] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={15} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className={cn(
                'w-full pl-9 pr-10 py-2.5 bg-[#1a1a24] border rounded-lg text-sm text-white placeholder-[#5a5a78] transition-colors',
                'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                errors.password ? 'border-red-500/60' : 'border-[#2a2a3a] hover:border-[#3a3a50]'
              )}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a78] hover:text-[#9090b0] transition-colors"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* API error */}
        {isError && error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <p className="text-xs text-red-400">{error.message}</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isPending}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white transition-all',
            'bg-gradient-brand hover:opacity-90 shadow-brand',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isPending ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </motion.button>

        {/* Link */}
        <p className="text-center text-xs text-[#9090b0]">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
            Create one
          </Link>
        </p>
      </form>
    </motion.div>
  );
}
