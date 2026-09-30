"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type IssueDistributionChartProps = {
  data: {
    issues: {
      total: number;
      items: {
        severity: string;
      }[];
    };
  };
};

const COLORS = [
  "#4338CA",
  "#6366F1",
  "#A78BFA",
  "#C4B5FD",
  "#818CF8",
];

export default function IssueDistributionChart({
  data,
}: IssueDistributionChartProps) {
  const issues = data?.issues?.items ?? [];

  // Count issues according to their SonarQube severity
  const severityCounts: Record<string, number> = {};

  issues.forEach((issue) => {
    const severity = issue.severity;

    severityCounts[severity] =
      (severityCounts[severity] || 0) + 1;
  });

  // Convert the counts into chart data
  const issueData = Object.entries(severityCounts).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const totalIssues = data?.issues?.total ?? 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Issue Distribution
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Issues identified from SonarQube analysis
        </p>

      </div>

      <div className="grid items-center gap-8 md:grid-cols-2">

        {/* Donut */}
        <div className="relative">

          <ResponsiveContainer width="100%" height={280}>

            <PieChart>

              <Pie
                data={issueData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={4}
                stroke="none"
              >

                {issueData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}

              </Pie>

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  boxShadow:
                    "0 10px 25px rgba(0,0,0,0.08)",
                }}
              />

            </PieChart>

          </ResponsiveContainer>

          {/* Center value */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

            <div className="text-center">

              <p className="text-3xl font-bold text-gray-800">
                {totalIssues}
              </p>

              <p className="text-xs text-gray-500">
                Total Issues
              </p>

            </div>

          </div>

        </div>

        {/* Legend */}
        <div className="space-y-4">

          {issueData.map((item, index) => {

            const percentage =
              totalIssues > 0
                ? ((item.value / totalIssues) * 100).toFixed(0)
                : "0";

            return (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >

                <div className="flex items-center gap-3">

                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[index % COLORS.length],
                    }}
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {item.name}
                  </span>

                </div>

                <div className="text-right">

                  <span className="text-sm font-semibold text-gray-800">
                    {item.value}
                  </span>

                  <span className="ml-2 text-xs text-gray-400">
                    {percentage}%
                  </span>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}