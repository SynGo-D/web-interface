import Sidebar from "@/components/dashboard/Sidebar";
import PullRequestSelector from "@/components/developer/code-review/PullRequestSelector";
import ReviewHeader from "@/components/developer/code-review/ReviewHeader";
import ReviewIssues from "@/components/developer/code-review/ReviewIssues";
import ReviewSummary from "@/components/developer/code-review/ReviewSummary";

export default function CodeReviewPage() {
  return (
    <div className="min-h-screen bg-gray-100 text-lg">

      {/* Developer Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8">

        {/* Header */}
        <ReviewHeader />

        {/* Pull Request Selection */}
        <PullRequestSelector />

        {/* Review Summary */}
        <div className="mt-6">
          <ReviewSummary />
        </div>

        {/* Review Issues */}
        <div className="mt-6">
          <ReviewIssues />
        </div>

      </main>

    </div>
  );
}