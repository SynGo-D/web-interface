import {
  Activity,
  AlertOctagon,
  Clock,
  DollarSign,
  GitPullRequest,
  ListChecks,
} from "lucide-react";

import type { DebtSummary } from "@/lib/technicalDebtApi";
import {
  HEALTH_STYLES,
  formatCost,
  formatMinutes,
  healthStatusOf,
} from "./debtFormat";

export default function DebtSummaryCards({ summary }: { summary: DebtSummary }) {

  const health = HEALTH_STYLES[healthStatusOf(summary.average_health_score)];

  const cards = [
    {
      title: "Health Score",
      value: `${summary.average_health_score}/100`,
      note: health.label,
      noteClass: health.text,
      icon: Activity,
    },
    {
      title: "Technical Debt",
      value: formatMinutes(summary.total_debt_minutes),
      note: `${summary.total_debt_hours} hours to remediate`,
      noteClass: "text-gray-500",
      icon: Clock,
    },
    {
      title: "Estimated Cost",
      value: formatCost(summary.estimated_cost),
      note: "Developer time at the configured rate",
      noteClass: "text-gray-500",
      icon: DollarSign,
    },
    {
      title: "Debt Issues",
      value: summary.total_findings,
      note: `${summary.by_type.length} debt type${summary.by_type.length === 1 ? "" : "s"}`,
      noteClass: "text-gray-500",
      icon: ListChecks,
    },
    {
      title: "Critical & High Risk",
      value: summary.risk_counts.CRITICAL + summary.risk_counts.HIGH,
      note: `${summary.risk_counts.CRITICAL} critical, ${summary.risk_counts.HIGH} high`,
      noteClass:
        summary.risk_counts.CRITICAL > 0 ? "text-red-600" : "text-gray-500",
      icon: AlertOctagon,
    },
    {
      title: "Pull Requests",
      value: summary.pull_requests_analyzed,
      note: "Latest review of each PR",
      noteClass: "text-gray-500",
      icon: GitPullRequest,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.title}
            className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between gap-4">

              <div className="min-w-0">

                <p className="text-sm text-gray-500">
                  {item.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-800">
                  {item.value}
                </h2>

                <p className={`mt-2 text-sm ${item.noteClass}`}>
                  {item.note}
                </p>

              </div>

              <div className="rounded-xl bg-indigo-100 p-4">
                <Icon
                  size={28}
                  className="text-[#4338CA]"
                />
              </div>

            </div>
          </div>
        );
      })}
    </div>
  );
}
