import React, { useEffect, useState } from "react";
import { AttentionItem } from "./types";
import {
  formatEventSchedule,
  formatFullDateTime,
  getCategoryBadgeStyle,
  getUrgencyBadgeStyle,
  useLiveCountdown,
} from "./utils";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  MailIcon,
  SparklesIcon,
  XIcon,
} from "./Icons";

interface ItemDetailDrawerProps {
  item: AttentionItem | null;
  onClose: () => void;
  onToggleComplete: (id: string) => void;
  onDismiss: (id: string) => void;
  onToggleSubAction?: (itemId: string, actionId: string) => void;
}

export function ItemDetailDrawer({
  item,
  onClose,
  onToggleComplete,
  onDismiss,
  onToggleSubAction,
}: ItemDetailDrawerProps) {
  const [showDraftReply, setShowDraftReply] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const categoryStyle = getCategoryBadgeStyle(item?.category ?? "General");
  const urgencyStyle = getUrgencyBadgeStyle(item?.urgency ?? "NORMAL");
  const countdown = useLiveCountdown(item?.deadline);

  if (!item) return null;

  const handleCopySummary = () => {
    navigator.clipboard?.writeText(item.fullSummary);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-drawer-title"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content panel */}
      <div className="relative w-full max-w-xl h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col z-10 border-l border-zinc-200 dark:border-zinc-800 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}
              >
                {item.category}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${urgencyStyle.bg} ${urgencyStyle.text} ${urgencyStyle.border}`}
              >
                Urgency: {item.urgency}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Importance: {item.importance}
              </span>
            </div>
            <h2
              id="detail-drawer-title"
              className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug break-words"
            >
              {item.subject}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail panel"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sender & Context Banner */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/70 dark:bg-zinc-900/60">
            <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Sender Details</span>
              <span>Received {formatFullDateTime(item.receivedAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center justify-center font-bold text-sm shrink-0">
                {item.senderName[0]}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {item.senderName}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1.5">
                  <MailIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.senderEmail}</span>
                </div>
              </div>
            </div>
            {item.senderContext && (
              <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-300 italic border-t border-zinc-200/60 dark:border-zinc-800 pt-2.5">
                Context: {item.senderContext}
              </p>
            )}
          </div>

          {/* AI Reasoning Callout */}
          <div className="rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1.5">
              <SparklesIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Why OneMail flagged this item</span>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
              {item.reasonForAttention}
            </p>
          </div>

          {/* Date & Scheduling Details */}
          {(item.deadline || item.eventStart) && (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/40">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                Extracted Timeline
              </h3>
              {item.deadline && (
                <div className="flex items-center justify-between py-2 border-b border-zinc-200/60 dark:border-zinc-800 last:border-b-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <ClockIcon className="w-4 h-4 text-zinc-500" />
                    <span>Target Deadline</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        countdown.isOverdue
                          ? "bg-red-500/10 text-red-700 dark:text-red-400"
                          : countdown.isUrgent
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                      }`}
                    >
                      {countdown.label}
                    </span>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {formatFullDateTime(item.deadline)}
                    </div>
                  </div>
                </div>
              )}

              {item.eventStart && (
                <div className="flex items-center justify-between py-2 last:border-b-0">
                  <div className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <CalendarIcon className="w-4 h-4 text-zinc-500" />
                    <span>Scheduled Event</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {item.eventTitle || "Calendar Session"}
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                      {formatEventSchedule(item.eventStart, item.eventEnd)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full AI Summary */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Analysis Summary
              </h3>
              <button
                type="button"
                onClick={handleCopySummary}
                className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer"
              >
                {copiedNotification ? "Copied!" : "Copy summary"}
              </button>
            </div>
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {item.fullSummary}
            </div>
          </div>

          {/* Action Items Checklist */}
          {item.actionItems && item.actionItems.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Extracted Action Items ({item.actionItems.filter((a) => a.completed).length}/
                {item.actionItems.length})
              </h3>
              <ul className="space-y-2">
                {item.actionItems.map((act) => (
                  <li
                    key={act.id}
                    onClick={() => onToggleSubAction?.(item.id, act.id)}
                    className="flex items-start gap-2.5 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={act.completed}
                      onChange={() => onToggleSubAction?.(item.id, act.id)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                    <span
                      className={`text-xs text-zinc-800 dark:text-zinc-200 ${
                        act.completed ? "line-through text-zinc-400 dark:text-zinc-500" : ""
                      }`}
                    >
                      {act.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Draft Reply Simulation (Optional Prototype Feature) */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
            <button
              type="button"
              onClick={() => setShowDraftReply(!showDraftReply)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Simulate AI Response Draft</span>
              </div>
              <span className="text-zinc-400 text-xs">{showDraftReply ? "Hide" : "Generate"}</span>
            </button>

            {showDraftReply && (
              <div className="mt-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-800 space-y-2 text-xs">
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                  Draft prepared for {item.senderEmail}:
                </p>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg font-mono text-[11px] text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {`Hi ${item.senderName.split(" ")[0]},\n\nThanks for reaching out regarding "${item.subject}".\n\nI have reviewed the details and verified the next steps: ${item.actionRequired}.\n\nBest regards,\nAlex`}
                </div>
                <div className="text-[10px] text-zinc-400 italic">
                  * Local prototype simulation. No email will be dispatched.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                onToggleComplete(item.id);
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                item.isCompleted
                  ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              }`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{item.isCompleted ? "Mark as Incomplete" : "Mark Action Completed"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onDismiss(item.id);
                onClose();
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <XIcon className="w-4 h-4 text-zinc-400" />
              <span>Dismiss</span>
            </button>
          </div>

          <div className="text-center text-[10px] text-zinc-400">
            Local prototype view • State changes persist for this session only
          </div>
        </div>
      </div>
    </div>
  );
}
