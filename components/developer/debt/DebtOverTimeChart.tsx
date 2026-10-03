"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DebtSummary } from "@/lib/technicalDebtApi";
import {
  WINDOWS,
  buildDebtTimeline,
  defaultGranularity,
  type Granularity,
  type TimelinePoint,
} from "@/lib/debtTimeline";
import { formatMinutes } from "./debtFormat";

const LINE = "#4338CA";
const GRANULARITIES: Granularity[] = ["hour", "day", "week"];

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: TimelinePoint }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{point.label}</p>
      <p className="mt-1 text-gray-700">
        Total debt <span className="font-semibold">{formatMinutes(point.minutes)}</span>
      </p>
      <p className="mt-1 text-gray-500">
        {point.reviews === 0
          ? "No review in this period"
          : `${point.reviews} review${point.reviews === 1 ? "" : "s"} in this period`}
      </p>
    </div>
  );
}

/**
 * Total technical debt owed by the repository, over time.
 *
 * The y axis is the whole outstanding total rather than the debt each review
 * introduced, so the line answers "are we paying this down" instead of "how
 * big was the last pull request" — which the headline card already says.
 */
export default function DebtOverTimeChart({ trend }: { trend: DebtSummary["trend"] }) {
  const [granularity, setGranularity] = useState<Granularity | null>(null);
  const active = granularity ?? defaultGranularity(trend);

  const points = useMemo(() => buildDebtTimeline(trend, active), [trend, active]);
  // Enough labels to read the axis, never so many that they overlap, and
  // counted back from the newest so the current period is always labelled.
  const every = Math.max(1, Math.ceil(points.length / 7));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">

        <div>
          <h2 className="text-lg font-bold text-gray-800">Total technical debt</h2>
          <p className="mt-1 text-sm text-gray-500">
            Everything the repository owes, as it stood at each point in time
          </p>
        </div>

        <div className="flex rounded-lg bg-gray-100 p-1">
          {GRANULARITIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGranularity(option)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                option === active
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {WINDOWS[option].label}
            </button>
          ))}
        </div>

      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={points} margin={{ top: 10, right: 34, left: -10, bottom: 0 }}>

          <defs>
            <linearGradient id="debtOverTime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LINE} stopOpacity={0.28} />
              <stop offset="100%" stopColor={LINE} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            tickFormatter={(label: string, index: number) =>
              (points.length - 1 - index) % every === 0 ? label : ""
            }
            tick={{ fontSize: 12, fill: "#6B7280" }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#6B7280" }}
            tickFormatter={(value: number) => `${value}h`}
            width={56}
          />

          <Tooltip content={<ChartTooltip />} />

          <Area
            type="monotone"
            dataKey="hours"
            stroke={LINE}
            strokeWidth={2.5}
            fill="url(#debtOverTime)"
            dot={false}
            activeDot={{ r: 4 }}
          />

        </AreaChart>
      </ResponsiveContainer>

      <p className="mt-3 text-xs text-gray-500">
        Each pull request counts once, at its latest review. A flat stretch is a
        period in which nothing was analysed and nothing was paid down.
      </p>

    </div>
  );
}
