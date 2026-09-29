"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { DebtSummary } from "@/lib/technicalDebtApi";
import {
  RISKS,
  RISK_STYLES,
  formatMinutes,
  titleCase,
} from "./debtFormat";

const COLORS = [
  "#4338CA",
  "#6366F1",
  "#A78BFA",
  "#C4B5FD",
  "#818CF8",
  "#312E81",
];

export default function DebtBreakdown({ summary }: { summary: DebtSummary }) {

  const typeData = summary.by_type.map((t) => ({
    name: titleCase(t.debt_type),
    value: t.minutes,
    count: t.count,
  }));

  const maxRisk = Math.max(1, ...RISKS.map((r) => summary.risk_counts[r]));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Debt Breakdown
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Remediation time by debt type, and issues by risk
        </p>

      </div>

      <div className="grid items-center gap-8 md:grid-cols-2">

        {/* Debt by type */}
        <div className="relative">

          <ResponsiveContainer width="100%" height={220}>

            <PieChart>

              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={90}
                paddingAngle={4}
                stroke="none"
              >
                {typeData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => [formatMinutes(Number(value)), "Debt"]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
              />

            </PieChart>

          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {summary.total_debt_hours}h
              </p>
              <p className="text-xs text-gray-500">
                Total debt
              </p>
            </div>
          </div>

        </div>

        {/* Legend */}
        <div className="space-y-3">
          {typeData.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>

              <div className="text-right">
                <span className="text-sm font-semibold text-gray-800">
                  {formatMinutes(item.value)}
                </span>
                <span className="ml-2 text-xs text-gray-400">
                  {item.count} issue{item.count === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Risk bars */}
      <div className="mt-6 space-y-3 border-t border-gray-100 pt-6">
        {RISKS.map((risk) => {
          const count = summary.risk_counts[risk];

          return (
            <div
              key={risk}
              className="flex items-center gap-4"
            >
              <span className="w-20 text-sm font-medium text-gray-700">
                {titleCase(risk)}
              </span>

              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${RISK_STYLES[risk].bar}`}
                  style={{ width: `${(count / maxRisk) * 100}%` }}
                />
              </div>

              <span className="w-8 text-right text-sm font-semibold text-gray-800">
                {count}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
