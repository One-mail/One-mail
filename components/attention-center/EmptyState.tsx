import React from "react";
import { CheckCircleIcon, RotateCcwIcon, FilterIcon } from "./Icons";

interface EmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
  onResetData: () => void;
}

export function EmptyState({ isFiltered, onClearFilters, onResetData }: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
          <FilterIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          No items match this filter
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-1.5 mb-5">
          There are currently no attention items matching your selected filter or search criteria.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-emerald-300/50 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-950/20">
      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
        <CheckCircleIcon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Attention Center is all clear!
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mt-1.5 mb-5">
        All critical deadlines, scheduled events, and pending action items have been addressed or dismissed.
      </p>
      <button
        type="button"
        onClick={onResetData}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <RotateCcwIcon className="w-3.5 h-3.5" />
        Reload sample items
      </button>
    </div>
  );
}
