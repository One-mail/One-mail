export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type UrgencyLevel = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
export type ImportanceLevel = "LOW" | "MEDIUM" | "HIGH";

export type AttentionItemType = "action_required" | "deadline" | "event" | "response_required";

export type AttentionCategory =
  | "Client"
  | "Finance"
  | "Hiring"
  | "Engineering"
  | "Operations"
  | "Legal"
  | "General";

export interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AttentionItem {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  senderContext?: string;
  category: AttentionCategory;
  importance: ImportanceLevel;
  urgency: UrgencyLevel;
  type: AttentionItemType;
  shortSummary: string;
  fullSummary: string;
  reasonForAttention: string;
  actionRequired: string;
  actionItems?: ActionItem[];
  deadline?: string | null; // ISO 8601 string
  eventTitle?: string | null;
  eventStart?: string | null; // ISO 8601 string
  eventEnd?: string | null; // ISO 8601 string
  receivedAt: string; // ISO 8601 string
  isActionable: boolean;
  responseRequired: boolean;
  isCompleted: boolean;
  isDismissed: boolean;
}

export type FilterCategory =
  | "ALL"
  | "URGENT"
  | "ACTION_REQUIRED"
  | "DEADLINES"
  | "EVENTS"
  | "RESPONSE_REQUIRED";

export interface AttentionCenterSummaryCounts {
  needsAttention: number;
  upcomingDeadlines: number;
  upcomingEvents: number;
  openActions: number;
}
