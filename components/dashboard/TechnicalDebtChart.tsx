"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

type TechnicalDebtChartProps = {
  data: {
    technicalDebt: {
      minutes: number;
      hours: number;
      debtRatio: number;
      rating: string;
    };
  };
};

export default function TechnicalDebtChart({
  data,
}: TechnicalDebtChartProps) {

  const debtHours = data.technicalDebt.hours;

  const chartData = [
    {
      name: "Current",
      debt: debtHours,
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            Technical Debt
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current technical debt from SonarQube
          </p>
        </div>

        <div className="rounded-xl bg-indigo-50 px-4 py-2 text-right">

          <p className="text-xs text-gray-500">
            Current
          </p>

          <p className="text-xl font-bold text-[#4338CA]">
            {debtHours} hrs
          </p>

        </div>

      </div>

      {/* Rating */}
      <div className="mb-5 flex items-center gap-2">

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Rating {data.technicalDebt.rating}
        </span>

        <span className="text-sm text-gray-500">
          Debt ratio: {data.technicalDebt.debtRatio}%
        </span>

      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>

        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >

          <defs>
            <linearGradient
              id="debtGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#4338CA"
                stopOpacity={0.25}
              />

              <stop
                offset="100%"
                stopColor="#4338CA"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            formatter={(value) => [
              `${value} hrs`,
              "Technical Debt",
            ]}
          />

          <Area
            type="monotone"
            dataKey="debt"
            stroke="#4338CA"
            strokeWidth={3}
            fill="url(#debtGradient)"
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>
  );
}