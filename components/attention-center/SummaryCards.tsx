import React from "react";
import { FilterCategory } from "./types";
import {
  AlertTriangleIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
} from "./Icons";

interface SummaryCardsProps {
  counts: {
    needsAttention: number;
    upcomingDeadlines: number;
    upcomingEvents: number;
    openActions: number;
  };
  activeFilter: FilterCategory;
  onSelectFilter: (filter: FilterCategory) => void;
}

export function SummaryCards({ counts, activeFilter, onSelectFilter }: SummaryCardsProps) {
  const cards = [
    {
      id: "needs-attention",
      title: "Needs Attention",
      count: counts.needsAttention,
      filter: "ALL" as FilterCategory,
      description: "Critical & active triage items",
      icon: AlertTriangleIcon,
      accentBorder: "border-amber-500/30 hover:border-amber-500/60",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      badgeText: "High Priority",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300",
      isActive: activeFilter === "ALL" || activeFilter === "URGENT",
    },
    {
      id: "deadlines",
      title: "Upcoming Deadlines",
      count: counts.upcomingDeadlines,
      filter: "DEADLINES" as FilterCategory,
      description: "Cutoffs & due dates extracted",
      icon: ClockIcon,
      accentBorder: "border-red-500/30 hover:border-red-500/60",
      accentBg: "bg-red-500/10 text-red-600 dark:text-red-400",
      badgeText: "Time Sensitive",
      badgeColor: "bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300",
      isActive: activeFilter === "DEADLINES",
    },
    {
      id: "events",
      title: "Upcoming Events",
      count: counts.upcomingEvents,
      filter: "EVENTS" as FilterCategory,
      description: "Scheduled meetings & panels",
      icon: CalendarIcon,
      accentBorder: "border-blue-500/30 hover:border-blue-500/60",
      accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      badgeText: "Calendar Synced",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300",
      isActive: activeFilter === "EVENTS",
    },
    {
      id: "open-actions",
      title: "Open Actions",
      count: counts.openActions,
      filter: "ACTION_REQUIRED" as FilterCategory,
      description: "Pending tasks & response required",
      icon: CheckCircleIcon,
      accentBorder: "border-emerald-500/30 hover:border-emerald-500/60",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      badgeText: "Actionable",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300",
      isActive: activeFilter === "ACTION_REQUIRED",
    },
  ];

  return (
    <section aria-label="Attention Center Summary" className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectFilter(card.filter)}
              className={`group text-left relative p-5 rounded-xl border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${
                card.isActive
                  ? "bg-zinc-100/90 dark:bg-zinc-900/90 border-zinc-900 dark:border-zinc-300 shadow-md ring-1 ring-zinc-900/10 dark:ring-zinc-300/20"
                  : `bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:shadow-md ${card.accentBorder}`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`inline-flex items-center justify-center p-2 rounded-lg ${card.accentBg}`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeColor}`}
                >
                  {card.badgeText}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {card.count}
                  </div>
                  <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-1">
                    {card.title}
                  </div>
                </div>
                <ChevronRightIcon
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 group-hover:translate-x-1 ${
                    card.isActive ? "text-zinc-900 dark:text-zinc-100" : ""
                  }`}
                />
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-1">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
