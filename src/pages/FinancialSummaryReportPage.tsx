import { FinancialSummaryReport } from "@/components/reports/FinancialSummaryReport";
import { AppLayout } from "@/components/layout/AppLayout";

export default function FinancialSummaryReportPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <FinancialSummaryReport />
      </div>
    </AppLayout>
  );
}