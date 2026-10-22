import React from "react";
import { AttentionItem } from "./types";
import {
  formatEventSchedule,
  getCategoryBadgeStyle,
  getUrgencyBadgeStyle,
  useLiveCountdown,
} from "./utils";
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  XIcon,
  ArrowRightIcon,
} from "./Icons";

interface PriorityCardProps {
  item: AttentionItem;
  isSelected: boolean;
  onSelect: (item: AttentionItem) => void;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onDismiss: (id: string, e: React.MouseEvent) => void;
}

export function PriorityCard({
  item,
  isSelected,
  onSelect,
  onToggleComplete,
  onDismiss,
}: PriorityCardProps) {
  const categoryStyle = getCategoryBadgeStyle(item.category);
  const urgencyStyle = getUrgencyBadgeStyle(item.urgency);
  const countdown = useLiveCountdown(item.deadline);

  // Initials for avatar
  const initials = item.senderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.subject}`}
      className={`group relative text-left rounded-xl p-5 border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${
        item.isCompleted
          ? "bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 opacity-70"
          : isSelected
          ? "bg-zinc-50 dark:bg-zinc-900/90 border-zinc-900 dark:border-zinc-100 shadow-md ring-1 ring-zinc-900/10 dark:ring-zinc-100/20"
          : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-md"
      }`}
    >
      {/* Top Header: Sender info & badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
              item.isCompleted
                ? "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
            }`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate block">
              {item.senderName}
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate block">
              {item.senderEmail}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}
          >
            {item.category}
          </span>
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${urgencyStyle.bg} ${urgencyStyle.text} ${urgencyStyle.border}`}
          >
            {item.urgency}
          </span>
          {item.isCompleted && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Subject Line */}
      <h3
        className={`text-base font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${
          item.isCompleted ? "line-through text-zinc-500 dark:text-zinc-400" : ""
        }`}
      >
        {item.subject}
      </h3>

      {/* Short Summary */}
      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3 line-clamp-2">
        {item.shortSummary}
      </p>

      {/* AI Reason for Attention callout */}
      <div className="rounded-lg bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-2.5 mb-3 flex items-start gap-2">
        <SparklesIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-300">
          <span className="font-semibold">Why this matters: </span>
          {item.reasonForAttention}
        </div>
      </div>

      {/* Action Required Box */}
      {item.actionRequired && (
        <div className="rounded-lg bg-zinc-100/70 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-2.5 mb-3.5 flex items-start gap-2">
          <AlertTriangleIcon className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-800 dark:text-zinc-200">
            <span className="font-semibold">Action Required: </span>
            {item.actionRequired}
          </div>
        </div>
      )}

      {/* Bottom Bar: Date/Countdown & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Date / Countdown Status */}
        <div className="flex items-center gap-2 text-xs">
          {item.type === "event" && item.eventStart ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{formatEventSchedule(item.eventStart, item.eventEnd)}</span>
            </div>
          ) : item.deadline ? (
            <div
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium ${
                countdown.isOverdue
                  ? "bg-red-500/10 text-red-700 dark:text-red-400 animate-pulse"
                  : countdown.isUrgent
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <ClockIcon className="w-3.5 h-3.5" />
              <span>{countdown.label}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[11px]">
              <ClockIcon className="w-3 h-3 text-zinc-400" />
              <span>No deadline set</span>
            </div>
          )}

          {item.responseRequired && (
            <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/10">
              Reply Needed
            </span>
          )}
        </div>

        {/* Interactive Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={(e) => onToggleComplete(item.id, e)}
            aria-label={item.isCompleted ? "Mark incomplete" : "Mark completed"}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              item.isCompleted
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300"
                : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            }`}
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            <span>{item.isCompleted ? "Completed" : "Complete"}</span>
          </button>

          <button
            type="button"
            onClick={(e) => onDismiss(item.id, e)}
            title="Dismiss from Attention Center view"
            aria-label="Dismiss item"
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>

          <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 pl-1 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
            Details
            <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
