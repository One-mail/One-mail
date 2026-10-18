import React from "react";
import { AttentionItem } from "./types";
import { PriorityCard } from "./PriorityCard";
import { EmptyState } from "./EmptyState";

interface PriorityListProps {
  items: AttentionItem[];
  selectedId: string | null;
  onSelect: (item: AttentionItem) => void;
  onToggleComplete: (id: string, e: React.MouseEvent) => void;
  onDismiss: (id: string, e: React.MouseEvent) => void;
  isFiltered: boolean;
  onClearFilters: () => void;
  onResetData: () => void;
}

export function PriorityList({
  items,
  selectedId,
  onSelect,
  onToggleComplete,
  onDismiss,
  isFiltered,
  onClearFilters,
  onResetData,
}: PriorityListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        isFiltered={isFiltered}
        onClearFilters={onClearFilters}
        onResetData={onResetData}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3.5">
      {items.map((item) => (
        <PriorityCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          onSelect={onSelect}
          onToggleComplete={onToggleComplete}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
