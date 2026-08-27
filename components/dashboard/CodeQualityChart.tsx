"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

type CodeQualityChartProps = {
  data: {
    summary: {
      bugs: number;
      vulnerabilities: number;
      codeSmells: number;
      coverage: number;
    };

    complexity: {
      complexity: number;
      cognitiveComplexity: number;
    };

    duplication: {
      percentage: number;
    };
  };
};

export default function CodeQualityChart({
  data,
}: CodeQualityChartProps) {

  const qualityData = [
  {
    metric: "Bugs",
    value: data.summary.bugs,
  },
  {
    metric: "Vulnerabilities",
    value: data.summary.vulnerabilities,
  },
  {
    metric: "Code Smells",
    value: data.summary.codeSmells,
  },
  {
    metric: "Coverage",
    value: data.summary.coverage,
  },
  {
    metric: "Duplication",
    value: data.duplication.percentage,
  },
  {
    metric: "Complexity",
    value: data.complexity.complexity,
  },
  {
    metric: "Cognitive",
    value: data.complexity.cognitiveComplexity,
  },
];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6">

        <h2 className="text-lg font-bold text-gray-800">
          Code Quality
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Code quality metrics from SonarQube
        </p>

      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>

        <BarChart
          data={qualityData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey="metric"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#6B7280",
              fontSize: 11,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [value, "Value"]}
          />

          <Bar
            dataKey="value"
            radius={[8, 8, 0, 0]}
            barSize={35}
          >

            {qualityData.map((entry) => (
              <Cell
                key={entry.metric}
                fill="#4338CA"
              />
            ))}

          </Bar>

        </BarChart>

      </ResponsiveContainer>

    </div>
  );
}