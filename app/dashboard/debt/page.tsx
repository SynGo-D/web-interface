import Sidebar from "@/components/dashboard/Sidebar";
import DebtDashboard from "@/components/developer/debt/DebtDashboard";

export default function DebtCalculationPage() {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Developer Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen p-6 lg:p-8">
        <DebtDashboard />
      </main>

    </div>
  );
}
