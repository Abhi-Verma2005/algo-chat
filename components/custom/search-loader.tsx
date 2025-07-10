import React from 'react';

export const SearchLoader = () => {
  return (
    <div className="flex items-center justify-center space-x-2 p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
      <div className="relative">
        <div className="w-4 h-4 border-2 border-zinc-600 border-t-emerald-400 rounded-full animate-spin"></div>
      </div>
      <div className="relative">
        <span className="text-zinc-400 text-sm font-medium">Searching</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
      </div>
    </div>
  );
};

export const ShiningText = ({ children, className = "" }: { children: string; className?: string }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <span className="text-zinc-400">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
    </div>
  );
}; 