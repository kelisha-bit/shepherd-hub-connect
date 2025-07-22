import { MemberGrowthReport } from "@/components/reports/MemberGrowthReport";
import { AppLayout } from "@/components/layout/AppLayout";

export default function MemberGrowthReportPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <MemberGrowthReport />
      </div>
    </AppLayout>
  );
}