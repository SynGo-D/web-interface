import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from "lucide-react";

const summary = [
  {
    title: "Critical Issues",
    value: "2",
    icon: XCircle,
    background: "bg-red-50",
    iconColor: "text-red-600",
    valueColor: "text-red-600",
  },
  {
    title: "Major Issues",
    value: "7",
    icon: AlertTriangle,
    background: "bg-yellow-50",
    iconColor: "text-yellow-600",
    valueColor: "text-yellow-600",
  },
  {
    title: "Minor Issues",
    value: "14",
    icon: AlertTriangle,
    background: "bg-blue-50",
    iconColor: "text-blue-600",
    valueColor: "text-blue-600",
  },
  {
    title: "Review Status",
    value: "Passed",
    icon: CheckCircle2,
    background: "bg-green-50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
];

export default function ReviewSummary() {
  return (
    <div>

      <div className="mb-4">

        <h2 className="text-lg font-bold text-gray-800">
          Review Summary
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Automated analysis results for the selected Pull Request.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">

        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >

              <div className="flex items-center justify-between">

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.background}`}
                >

                  <Icon
                    size={21}
                    className={item.iconColor}
                  />

                </div>

              </div>

              <p className="mt-4 text-sm text-gray-500">
                {item.title}
              </p>

              <p
                className={`mt-1 text-2xl font-bold ${item.valueColor}`}
              >
                {item.value}
              </p>

            </div>
          );
        })}

      </div>

      {/* Quality Score */}
      <div className="mt-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold text-gray-800">
              Code Quality Score
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Overall quality of the Pull Request
            </p>

          </div>

          <span className="text-3xl font-bold text-[#4338CA]">
            84
          </span>

        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">

          <div
            className="h-full rounded-full bg-[#4338CA]"
            style={{
              width: "84%",
            }}
          />

        </div>

        <div className="mt-2 flex justify-between text-xs text-gray-400">

          <span>0</span>

          <span>100</span>

        </div>

      </div>

    </div>
  );
}