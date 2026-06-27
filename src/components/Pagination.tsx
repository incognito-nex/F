import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  theme: any;
}

export default function Pagination({ currentPage, onPageChange, hasNextPage = true, theme }: PaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-3 font-mono pt-6">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ borderColor: theme.borderColor }}
        className="p-2 px-4 rounded-xl border text-xs font-bold flex items-center space-x-1.5 hover:bg-white/5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition duration-150 cursor-pointer text-zinc-300"
      >
        <ArrowLeft size={12} />
        <span>Prev</span>
      </button>

      <span className="text-xs font-extrabold px-3 py-1 bg-black/40 border rounded-lg text-zinc-300" style={{ borderColor: theme.borderColor }}>
        PAGE {currentPage}
      </span>

      <button
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ borderColor: theme.borderColor }}
        className="p-2 px-4 rounded-xl border text-xs font-bold flex items-center space-x-1.5 hover:bg-white/5 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition duration-150 cursor-pointer text-zinc-300"
      >
        <span>Next</span>
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
