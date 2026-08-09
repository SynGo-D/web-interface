import ManagerSidebar from "@/components/manager/ManagerSidebar";
import ManagerDashboardCards from "@/components/manager/ManagerDashboardCards";
import ProjectProgressChart from "@/components/manager/ProjectProgressChart";
import TechnicalDebtTrend from "@/components/manager/TechnicalDebtTrend";
import TeamPerformance from "@/components/manager/TeamPerformance";
import ProjectStatus from "@/components/manager/ProjectStatus";
import UpcomingDeadlines from "@/components/manager/UpcomingDeadlines";
import RecentReports from "@/components/manager/RecentReports";

export default function ManagerDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <ManagerSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-800">
              Project Manager Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor your projects, teams, and overall project health.
            </p>

          </div>

          <div className="rounded-xl bg-[#4338CA] px-5 py-3 text-sm font-semibold text-white shadow">
            Project Manager
          </div>

        </div>

        {/* Summary Cards */}
        <ManagerDashboardCards />

        {/* Main Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <ProjectProgressChart />

          <TechnicalDebtTrend />

        </div>

        {/* Project + Team */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <ProjectStatus />

          <TeamPerformance />

        </div>

        {/* Deadlines + Reports */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <UpcomingDeadlines />

          <RecentReports />

        </div>

      </main>

    </div>
  );
}