import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminDashboardCards from "@/components/admin/AdminDashboardCards";
import SystemActivityChart from "@/components/admin/SystemActivityChart";
import ProjectStatusChart from "@/components/admin/ProjectStatusChart";
import SystemHealth from "@/components/admin/SystemHealth";
import RecentUsers from "@/components/admin/RecentUsers";
import RecentProjects from "@/components/admin/RecentProjects";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-8">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-800">
              Administrator Dashboard
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor and manage the entire CodeReview platform.
            </p>

          </div>

          <div className="rounded-xl bg-[#4338CA] px-5 py-3 text-sm font-semibold text-white shadow">
            Administrator
          </div>

        </div>

        {/* Summary Cards */}
        <AdminDashboardCards />

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">

          <SystemActivityChart />

          <ProjectStatusChart />

        </div>

        {/* System Health */}
        <div className="mt-6">
          <SystemHealth />
        </div>

        {/* Users + Projects */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <RecentUsers />

          <RecentProjects />

        </div>

      </main>

    </div>
  );
}