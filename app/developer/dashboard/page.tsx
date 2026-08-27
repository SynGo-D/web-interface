import Sidebar from "@/components/dashboard/Sidebar";
import DashboardCards from "@/components/dashboard/DashboardCards";
import TechnicalDebtChart from "@/components/dashboard/TechnicalDebtChart";
import CodeQualityChart from "@/components/dashboard/CodeQualityChart";
import IssueDistributionChart from "@/components/dashboard/IssueDistributionChart";
import ContributorsTable from "@/components/dashboard/ContributorsTable";
import RecentPullRequests from "@/components/dashboard/RecentPullRequests";
import RecentCodeReviews from "@/components/dashboard/RecentCodeReviews";

import { getSonarDashboard } from "@/lib/sonarApi";

export default async function DashboardPage() {
  const sonarData = await getSonarDashboard();

  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <main className="ml-64 min-h-screen p-6 lg:p-8">

        {/* Header */}
        <div className="mb-7 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-800 lg:text-4xl">
              Welcome Back 👋
            </h1>

            <p className="mt-1 text-sm text-gray-500 lg:text-base">
              Here's what's happening with your repositories today.
            </p>
          </div>

          <div className="rounded-lg bg-[#4338CA] px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Senior Developer
          </div>

        </div>

        {/* Summary Cards */}
        <DashboardCards data={sonarData} />

        {/* Technical Debt + Issue Distribution */}
        <div className="mt-7 grid gap-6 lg:grid-cols-2">

          <TechnicalDebtChart data={sonarData} />

          <IssueDistributionChart data={sonarData} />

        </div>

        {/* Code Quality + Top Contributors */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <CodeQualityChart data={sonarData} />

          <ContributorsTable />

        </div>

        {/* Recent Activity */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          <RecentPullRequests />

          <RecentCodeReviews />

        </div>

      </main>

    </div>
  );
}