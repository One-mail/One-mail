import React from "react";
import { FilterCategory } from "./types";
import { FilterIcon, XIcon } from "./Icons";

interface FilterTabsProps {
  activeFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
  filterCounts: Record<FilterCategory, number>;
  searchQuery: string;
  onClearSearch: () => void;
}

export function FilterTabs({
  activeFilter,
  onSelectFilter,
  filterCounts,
  searchQuery,
  onClearSearch,
}: FilterTabsProps) {
  const tabs: { key: FilterCategory; label: string }[] = [
    { key: "ALL", label: "All Items" },
    { key: "URGENT", label: "Urgent" },
    { key: "ACTION_REQUIRED", label: "Action Required" },
    { key: "DEADLINES", label: "Deadlines" },
    { key: "EVENTS", label: "Events" },
    { key: "RESPONSE_REQUIRED", label: "Response Required" },
  ];

  const hasActiveModifiers = activeFilter !== "ALL" || searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <span className="text-zinc-400 dark:text-zinc-500 mr-1 hidden md:inline-flex items-center">
          <FilterIcon className="w-3.5 h-3.5" />
        </span>
        {tabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count = filterCounts[tab.key] ?? 0;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive
                    ? "bg-white/20 text-white dark:bg-zinc-900/30 dark:text-zinc-900"
                    : "bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {hasActiveModifiers && (
        <div className="flex items-center gap-2 text-xs">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
              Query: &ldquo;{searchQuery}&rdquo;
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear search query"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              onSelectFilter("ALL");
              onClearSearch();
            }}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-2 transition-colors cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
