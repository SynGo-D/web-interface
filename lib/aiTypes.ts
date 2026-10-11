export interface Finding {
  id: string;
  file: string;
  line: number;
  endLine: number;
  rule: string;
  severity: "error" | "warning" | "info";
  message: string;
  onChangedLine: boolean;
}

export interface Suggestion {
  findingId: string;
  classification: "issue" | "false_positive" | "low_priority";
  explanation: string;
  priority: "high" | "medium" | "low";
  severity: Finding["severity"];
  confidence: number;
  debtImpact: string;
  suggestedFix: string;
  fixAvailable: boolean;
}

export interface SuggestionReadyPullRequest {
  number: number;
  headSha: string;
  sourceBranch: string;
}

export type SuggestionJobStatus = "queued" | "collecting" | "generating_suggestion" |
  "patch_ready" | "already_fixed" | "failed";

export interface SuggestionJob {
  id: string;
  status: SuggestionJobStatus;
  findings: Finding[];
  suggestions: Suggestion[];
  error: { code: string; message: string } | null;
}
