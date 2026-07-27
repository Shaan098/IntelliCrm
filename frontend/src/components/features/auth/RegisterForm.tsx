import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ChevronDown, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import { shakeVariants } from '@/animations/variants';

const schema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['admin', 'support', 'hr'] as const, { required_error: 'Select a role' }),
});

type FormData = z.infer<typeof schema>;

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'admin',   label: 'Admin',   desc: 'Full access to all documents & users' },
  { value: 'support', label: 'Support', desc: 'Access to technical & general docs' },
  { value: 'hr',      label: 'HR',      desc: 'Access to HR & general documents' },
];

function PasswordStrength({ password }: { password: string }) {
  const strength = !password ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];

  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= strength ? colors[strength] : 'bg-[#2a2a3a]')} />
        ))}
      </div>
      <p className="text-xs text-[#9090b0]">Strength: <span className="text-white">{labels[strength]}</span></p>
    </div>
  );
}

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'support' },
  });

  const passwordValue = watch('password', '');

  const { mutate, isPending, error, isError } = useMutation({
    mutationFn: authService.register,
    onSuccess: async (_data, variables) => {
      // Auto-login after register
      const { token, user } = await authService.login({
        email: variables.email,
        password: variables.password,
      });
      login(user, token);
      navigate('/dashboard');
    },
  });

  const onSubmit = (data: FormData) => mutate(data);

  return (
    <motion.div animate={isError ? 'shake' : undefined} variants={shakeVariants}>
      <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
      <p className="text-sm text-[#9090b0] mb-7">Join IntelliCRM — AI-powered knowledge platform</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-[#9090b0] mb-1.5">Full name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={15} />
            <input
              id="name" type="text" autoComplete="name" {...register('name')}
              className={cn(
                'w-full pl-9 pr-4 py-2.5 bg-[#1a1a24] border rounded-lg text-sm text-white placeholder-[#5a5a78] transition-colors focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                errors.name ? 'border-red-500/60' : 'border-[#2a2a3a] hover:border-[#3a3a50]'
              )}
              placeholder="Jane Smith"
            />
          </div>
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-xs font-medium text-[#9090b0] mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={15} />
            <input
              id="reg-email" type="email" autoComplete="email" {...register('email')}
              className={cn(
                'w-full pl-9 pr-4 py-2.5 bg-[#1a1a24] border rounded-lg text-sm text-white placeholder-[#5a5a78] transition-colors focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                errors.email ? 'border-red-500/60' : 'border-[#2a2a3a] hover:border-[#3a3a50]'
              )}
              placeholder="you@company.com"
            />
          </div>
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-xs font-medium text-[#9090b0] mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a78]" size={15} />
            <input
              id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" {...register('password')}
              className={cn(
                'w-full pl-9 pr-10 py-2.5 bg-[#1a1a24] border rounded-lg text-sm text-white placeholder-[#5a5a78] transition-colors focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                errors.password ? 'border-red-500/60' : 'border-[#2a2a3a] hover:border-[#3a3a50]'
              )}
              placeholder="Min. 8 characters"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a78] hover:text-[#9090b0] transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <PasswordStrength password={passwordValue} />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-xs font-medium text-[#9090b0] mb-1.5">Role</label>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a5a78] pointer-events-none" size={15} />
            <select
              id="role" {...register('role')}
              className={cn(
                'w-full pl-3 pr-8 py-2.5 bg-[#1a1a24] border rounded-lg text-sm text-white appearance-none transition-colors focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                errors.role ? 'border-red-500/60' : 'border-[#2a2a3a] hover:border-[#3a3a50]'
              )}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
              ))}
            </select>
          </div>
          {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role.message}</p>}
          <p className="text-xs text-[#5a5a78] mt-1.5">⚠ Demo only — any role can be selected</p>
        </div>

        {/* API Error */}
        {isError && error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">{error.message}</p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.98 }} type="submit" disabled={isPending}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-brand hover:opacity-90 shadow-brand disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
        >
          {isPending ? <><Loader2 size={15} className="animate-spin" />Creating account...</> : 'Create account'}
        </motion.button>

        <p className="text-center text-xs text-[#9090b0]">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">Sign in</Link>
        </p>
      </form>
    </motion.div>
  );
}
