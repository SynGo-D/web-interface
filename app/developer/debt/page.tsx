import Sidebar from "@/components/dashboard/Sidebar";
import DebtDashboard from "@/components/developer/debt/DebtDashboard";

export default function DebtCalculationPage() {
  return (
    <div className="flex h-screen">

      {/* Developer Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6 lg:p-8">
        <DebtDashboard />
      </main>

    </div>
  );
}
