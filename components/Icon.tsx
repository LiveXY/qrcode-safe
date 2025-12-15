import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const AppIcon: React.FC<{ className?: string, size?: number }> = ({ className = "", size = 120 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-brand-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        <ShieldCheck size={size} className="text-brand-500 relative z-10" strokeWidth={1.5} />
        <Lock size={size / 2.5} className="text-white absolute z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" strokeWidth={2.5} />
    </div>
  );
};
