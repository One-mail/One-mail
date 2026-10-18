"use client";

import React, { useMemo, useState } from "react";
import {
  AttentionCenterSummaryCounts,
  AttentionItem,
  FilterCategory,
} from "./types";
import { INITIAL_ATTENTION_ITEMS } from "./mock-data";
import { SummaryCards } from "./SummaryCards";
import { FilterTabs } from "./FilterTabs";
import { PriorityList } from "./PriorityList";
import { ItemDetailDrawer } from "./ItemDetailDrawer";
import { Navbar } from "./Navbar";
import { SparklesIcon } from "./Icons";

export function AttentionCenter() {
  const [items, setItems] = useState<AttentionItem[]>(INITIAL_ATTENTION_ITEMS);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Reset to initial mock items
  const handleResetData = () => {
    setItems(INITIAL_ATTENTION_ITEMS);
    setSelectedItemId(null);
    setActiveFilter("ALL");
    setSearchQuery("");
  };

  // Toggle completed state on an item
  const handleToggleComplete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  // Dismiss an item from view
  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isDismissed: true } : item))
    );
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  // Toggle sub-action item within a task checklist
  const handleToggleSubAction = (itemId: string, actionId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || !item.actionItems) return item;
        return {
          ...item,
          actionItems: item.actionItems.map((act) =>
            act.id === actionId ? { ...act, completed: !act.completed } : act
          ),
        };
      })
    );
  };

  // Compute active (non-dismissed) items
  const visibleNonDismissedItems = useMemo(() => {
    return items.filter((item) => !item.isDismissed);
  }, [items]);

  // Compute dynamic summary card counts
  const summaryCounts: AttentionCenterSummaryCounts = useMemo(() => {
    return {
      needsAttention: visibleNonDismissedItems.filter((i) => !i.isCompleted).length,
      upcomingDeadlines: visibleNonDismissedItems.filter(
        (i) => !i.isCompleted && (i.type === "deadline" || i.deadline !== null)
      ).length,
      upcomingEvents: visibleNonDismissedItems.filter(
        (i) => !i.isCompleted && (i.type === "event" || i.eventStart !== null)
      ).length,
      openActions: visibleNonDismissedItems.filter(
        (i) => !i.isCompleted && (i.isActionable || i.type === "action_required")
      ).length,
    };
  }, [visibleNonDismissedItems]);

  // Compute filter counts
  const filterCounts = useMemo(() => {
    const base = visibleNonDismissedItems;
    return {
      ALL: base.length,
      URGENT: base.filter((i) => i.urgency === "CRITICAL" || i.urgency === "HIGH").length,
      ACTION_REQUIRED: base.filter((i) => i.isActionable || i.type === "action_required").length,
      DEADLINES: base.filter((i) => i.type === "deadline" || i.deadline !== null).length,
      EVENTS: base.filter((i) => i.type === "event" || i.eventStart !== null).length,
      RESPONSE_REQUIRED: base.filter((i) => i.responseRequired).length,
    };
  }, [visibleNonDismissedItems]);

  // Apply active filter and search query
  const filteredItems = useMemo(() => {
    return visibleNonDismissedItems.filter((item) => {
      // 1. Filter match
      let matchesFilter = true;
      switch (activeFilter) {
        case "URGENT":
          matchesFilter = item.urgency === "CRITICAL" || item.urgency === "HIGH";
          break;
        case "ACTION_REQUIRED":
          matchesFilter = item.isActionable || item.type === "action_required";
          break;
        case "DEADLINES":
          matchesFilter = item.type === "deadline" || item.deadline !== null;
          break;
        case "EVENTS":
          matchesFilter = item.type === "event" || item.eventStart !== null;
          break;
        case "RESPONSE_REQUIRED":
          matchesFilter = item.responseRequired;
          break;
        case "ALL":
        default:
          matchesFilter = true;
          break;
      }

      if (!matchesFilter) return false;

      // 2. Search query match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchSubject = item.subject.toLowerCase().includes(q);
      const matchSender =
        item.senderName.toLowerCase().includes(q) ||
        item.senderEmail.toLowerCase().includes(q);
      const matchSummary = item.shortSummary.toLowerCase().includes(q);
      const matchAction = item.actionRequired?.toLowerCase().includes(q);
      const matchReason = item.reasonForAttention.toLowerCase().includes(q);

      return matchSubject || matchSender || matchSummary || matchAction || matchReason;
    });
  }, [visibleNonDismissedItems, activeFilter, searchQuery]);

  // Item currently selected for the detail drawer
  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || null;
  }, [items, selectedItemId]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 flex flex-col font-sans">
      {/* Navigation Header */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetData={handleResetData}
        activeCount={summaryCounts.needsAttention}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Product Promise Banner */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <SparklesIcon className="w-3.5 h-3.5" />
              </span>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Attention Center
              </h1>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Your inbox tells you what happened. OneMail tells you what matters, what you need to do, and when you need to act.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg shrink-0">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Pipeline Flow:</span>
            <span>Understand → Prioritize → Notify → Act → Remember</span>
          </div>
        </div>

        {/* Dynamic Summary Cards */}
        <SummaryCards
          counts={summaryCounts}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
        />

        {/* Section Heading & Filter Tabs */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Triaged Action Queue
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                {filteredItems.length}
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <FilterTabs
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            filterCounts={filterCounts}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery("")}
          />

          {/* Priority List */}
          <PriorityList
            items={filteredItems}
            selectedId={selectedItemId}
            onSelect={(item) => setSelectedItemId(item.id)}
            onToggleComplete={handleToggleComplete}
            onDismiss={handleDismiss}
            isFiltered={activeFilter !== "ALL" || searchQuery.trim().length > 0}
            onClearFilters={() => {
              setActiveFilter("ALL");
              setSearchQuery("");
            }}
            onResetData={handleResetData}
          />
        </div>
      </main>

      {/* Slide-out Detail Drawer */}
      <ItemDetailDrawer
        key={selectedItem?.id ?? "none"}
        item={selectedItem}
        onClose={() => setSelectedItemId(null)}
        onToggleComplete={(id) => handleToggleComplete(id)}
        onDismiss={(id) => handleDismiss(id)}
        onToggleSubAction={handleToggleSubAction}
      />
    </div>
  );
}
