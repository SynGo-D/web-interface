import type { HealthStatus, Risk } from "@/lib/technicalDebtApi";

export const RISKS: Risk[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export const RISK_STYLES: Record<Risk, { badge: string; bar: string; icon: string; background: string }> = {
  CRITICAL: { badge: "bg-red-100 text-red-700", bar: "bg-red-500", icon: "text-red-600", background: "bg-red-50" },
  HIGH: { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500", icon: "text-orange-600", background: "bg-orange-50" },
  MEDIUM: { badge: "bg-yellow-100 text-yellow-700", bar: "bg-yellow-400", icon: "text-yellow-600", background: "bg-yellow-50" },
  LOW: { badge: "bg-blue-100 text-blue-700", bar: "bg-blue-500", icon: "text-blue-600", background: "bg-blue-50" },
};

export const HEALTH_STYLES: Record<HealthStatus, { badge: string; text: string; label: string }> = {
  HEALTHY: { badge: "bg-green-100 text-green-700", text: "text-green-600", label: "Healthy" },
  GOOD: { badge: "bg-indigo-100 text-[#4338CA]", text: "text-[#4338CA]", label: "Good" },
  NEEDS_ATTENTION: { badge: "bg-yellow-100 text-yellow-700", text: "text-yellow-600", label: "Needs attention" },
  CRITICAL: { badge: "bg-red-100 text-red-700", text: "text-red-600", label: "Critical" },
};

export function healthStatusOf(score: number): HealthStatus {
  if (score >= 90) return "HEALTHY";
  if (score >= 70) return "GOOD";
  if (score >= 50) return "NEEDS_ATTENTION";
  return "CRITICAL";
}

// 95 -> "1h 35m", 45 -> "45m"
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatCost(cost: number | null): string {
  return cost == null ? "—" : `$${cost.toFixed(2)}`;
}

export function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
