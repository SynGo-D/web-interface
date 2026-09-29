import { Calculator, Sparkles } from "lucide-react";

export default function DebtHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4338CA]/10">
          <Calculator
            size={26}
            className="text-[#4338CA]"
          />
        </div>

        <div>

          <h1 className="text-3xl font-bold text-gray-800">
            Technical Debt
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Remediation effort, cost and risk estimated from each Pull Request&apos;s analysis.
          </p>

        </div>

      </div>

      <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2">

        <Sparkles
          size={18}
          className="text-[#4338CA]"
        />

        <span className="text-sm font-medium text-[#4338CA]">
          AI classification &amp; estimation
        </span>

      </div>

    </div>
  );
}
