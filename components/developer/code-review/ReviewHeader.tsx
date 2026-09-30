import {
  GitPullRequest,
  ShieldCheck,
} from "lucide-react";

export default function ReviewHeader() {
  return (
    <div className="flex items-center justify-between">

      <div>

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4338CA]/10">
            <GitPullRequest
              size={26}
              className="text-[#4338CA]"
            />
          </div>

          <div>

            <h1 className="text-3xl font-bold text-gray-800">
              Code Review
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review Pull Requests and identify code quality issues.
            </p>

          </div>

        </div>

      </div>

      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2">

        <ShieldCheck
          size={18}
          className="text-green-600"
        />

        <span className="text-sm font-medium text-green-700">
          Automated Review Active
        </span>

      </div>

    </div>
  );
}