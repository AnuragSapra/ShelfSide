import ActiveRequestsTable from "../components/ActiveRequestsTable";
import OverdueTable from "../components/OverdueTable";
import PastRequestsTable from "../components/PastRequestsTable";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#12343B] text-[#F8F8F6]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-[#E1B382] mb-10">
          Admin Dashboard
        </h1>

        <div className="space-y-10">
          <ActiveRequestsTable />
          <OverdueTable />
          <PastRequestsTable />
        </div>
      </div>
    </div>
  );
}
