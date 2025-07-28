import { ReportsList } from "@/components/reports/ReportsList";
import { AppLayout } from "@/components/layout/AppLayout";

export default function TestReportsPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Test Reports</h1>
        <ReportsList />
      </div>
    </AppLayout>
  );
} 