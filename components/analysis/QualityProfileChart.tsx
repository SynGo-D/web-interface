"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { AnalysisResult } from "@/lib/api";
import {
  buildQualityProfile,
  selectComparison,
  type AxisScore,
  type QualityProfile,
} from "@/lib/qualityProfile";

const CURRENT = "#4338CA";
const PREVIOUS = "#F59E0B";

type Row = {
  axis: string;
  current: number;
  previous: number | null;
  detail: AxisScore;
  before: AxisScore | null;
};

function rowsOf(current: QualityProfile, previous: QualityProfile | null): Row[] {
  return current.axes.map((a) => {
    const before = previous?.axes.find((p) => p.axis === a.axis) ?? null;
    return {
      axis: a.axis,
      current: a.score,
      previous: before ? before.score : null,
      detail: a,
      before,
    };
  });
}

/**
 * Axis labels in full, wrapped onto two lines rather than abbreviated.
 * "Maintain." saves a few pixels and costs the reader the word.
 */
function AxisLabel(props: {
  payload?: { value: string };
  x?: number;
  y?: number;
  cy?: number;
  textAnchor?: "start" | "middle" | "end" | "inherit";
}) {
  const { payload, x = 0, y = 0, cy = 0, textAnchor } = props;
  const words = (payload?.value ?? "").split(" ");
  const lines = words.length > 1 ? [words[0], words.slice(1).join(" ")] : words;
  // Two-line labels above the centre grow upwards, so lift them clear of the grid.
  const lift = lines.length > 1 && y < cy ? -12 : 0;

  return (
    <text x={x} y={y + lift} textAnchor={textAnchor} fill="#4B5563" fontSize={12}>
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  const d = row.detail;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs shadow-lg">
      <p className="font-semibold text-gray-900">{row.axis}</p>
      <p className="mt-1 text-gray-700">
        Score <span className="font-semibold">{d.score}</span>/100
        {row.previous !== null && (
          <span className="text-gray-500"> (was {row.previous})</span>
        )}
      </p>
      <p className="mt-1 text-gray-500">
        {d.count} finding{d.count === 1 ? "" : "s"}
        {d.errors > 0 && `, ${d.errors} error${d.errors === 1 ? "" : "s"}`}
        {d.warnings > 0 && `, ${d.warnings} warning${d.warnings === 1 ? "" : "s"}`}
      </p>
      <p className="text-gray-500">{d.density} weighted per 1,000 lines</p>
    </div>
  );
}

function Delta({ now, before }: { now: number; before: number | null }) {
  if (before === null) return <span className="text-gray-400">&mdash;</span>;
  const change = now - before;
  if (change === 0) return <span className="text-gray-400">no change</span>;
  // Higher is better on every axis, so a rise is an improvement.
  return (
    <span className={change > 0 ? "text-green-600" : "text-red-600"}>
      {change > 0 ? "+" : ""}{change}
    </span>
  );
}

/**
 * The seven-axis quality profile of the most recent analysis, overlaid on the
 * previous pull request for comparison.
 *
 * Higher is better on every axis, which is the opposite of the raw finding
 * counts underneath. A radar where a larger shape means worse code reads
 * backwards at a glance, and the glance is the entire point of a radar; the
 * table beside it carries the actual counts for anyone who wants them.
 */
export default function QualityProfileChart({ results }: { results: AnalysisResult[] }) {
  const { current, previous } = selectComparison(results);
  const profile = buildQualityProfile(current);
  const before = buildQualityProfile(previous);

  if (!profile) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Code quality profile</h2>
        <p className="mt-1 text-sm text-gray-500">
          Appears once a pull request has been analysed successfully.
        </p>
      </div>
    );
  }

  const rows = rowsOf(profile, before);
  const worst = [...rows].sort((a, b) => a.current - b.current)[0];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Code quality profile</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Every axis scores 0&ndash;100 from linter findings per 1,000 lines, weighted by
            severity. Higher is better, so the wider the shape, the cleaner the code.
          </p>
        </div>

        <div className="rounded-lg bg-indigo-50 px-4 py-2 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Overall</p>
          <p className="text-2xl font-bold text-[#4338CA]">
            {profile.overall}
            <span className="text-base font-medium text-indigo-400">/100</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">

        <div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-600">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: CURRENT }} />
              PR #{profile.pullRequestNumber} &middot; {profile.linesAnalysed.toLocaleString()} lines
            </span>
            {before ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PREVIOUS }} />
                PR #{before.pullRequestNumber}, for comparison
              </span>
            ) : (
              <span className="text-gray-400">No earlier pull request to compare against yet</span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={rows} outerRadius="84%" margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="axis" tick={<AxisLabel />} />
              {/* The rings are the scale; numbered ticks collide with the labels. */}
              <PolarRadiusAxis domain={[0, 100]} tickCount={5} tick={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />

              {before && (
                <Radar
                  name="Previous"
                  dataKey="previous"
                  stroke={PREVIOUS}
                  fill={PREVIOUS}
                  fillOpacity={0.14}
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: PREVIOUS }}
                />
              )}
              <Radar
                name="Current"
                dataKey="current"
                stroke={CURRENT}
                fill={CURRENT}
                fillOpacity={0.18}
                strokeWidth={3}
                dot={{ r: 3, fill: CURRENT }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <p className="text-center text-xs text-gray-400">
            Rings mark 25, 50, 75 and 100; the centre is 0.
          </p>
        </div>

        <div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                <th className="pb-2 font-medium">Dimension</th>
                <th className="pb-2 text-right font-medium">Findings</th>
                <th className="pb-2 text-right font-medium">Per 1k lines</th>
                <th className="pb-2 text-right font-medium">Score</th>
                {before && <th className="pb-2 text-right font-medium">Change</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.axis} className="border-b border-gray-50 last:border-0">
                  <td className="py-2 pr-2 text-gray-700">{row.axis}</td>
                  <td className="py-2 text-right text-gray-700">{row.detail.count}</td>
                  <td className="py-2 text-right text-gray-500">{row.detail.density}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">{row.current}</td>
                  {before && (
                    <td className="py-2 text-right"><Delta now={row.current} before={row.previous} /></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-3 text-xs text-gray-500">
            Weakest dimension: <span className="font-semibold text-gray-700">{worst.axis}</span>{" "}
            at {worst.current}/100, from {worst.detail.count} finding
            {worst.detail.count === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
        Scores reflect the analysers that ran on this pull request
        {profile.tools.length > 0 && <> ({profile.tools.join(", ")})</>}. A dimension no
        analyser reported on scores 100 because nothing was found, not because nothing
        could be found.
      </p>
    </div>
  );
}
