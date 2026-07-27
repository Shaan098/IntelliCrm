import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// Merge Tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

// Format date + time
export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy · h:mm a');
}

// Relative time ("3 hours ago")
export function timeAgo(dateString: string): string {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Truncate long strings
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

// Format similarity as percentage
export function formatSimilarity(score: number): string {
  return `${(score * 100).toFixed(0)}%`;
}

// Get initials from a name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Map ticket status to display info
export function getStatusColor(status: string): string {
  switch (status) {
    case 'open':        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'in_progress': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'resolved':    return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'closed':      return 'text-[#5a5a78] bg-[#1a1a24] border-[#2a2a3a]';
    default:            return 'text-[#9090b0] bg-[#1a1a24] border-[#2a2a3a]';
  }
}

// Map document category to color
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'technical': return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    case 'hr':        return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    case 'finance':   return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'general':   return 'text-[#9090b0] bg-[#1a1a24] border-[#2a2a3a]';
    default:          return 'text-[#9090b0] bg-[#1a1a24] border-[#2a2a3a]';
  }
}

// Map role to badge color
export function getRoleColor(role: string): string {
  switch (role) {
    case 'admin':   return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    case 'support': return 'text-accent-400 bg-accent-500/10 border-accent-500/20';
    case 'hr':      return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    default:        return 'text-[#9090b0] bg-[#1a1a24] border-[#2a2a3a]';
  }
}

// Similarity → color
export function getSimilarityColor(score: number): string {
  if (score >= 0.8) return 'text-green-400';
  if (score >= 0.6) return 'text-yellow-400';
  return 'text-orange-400';
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
