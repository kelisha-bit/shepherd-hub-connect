import { EventAnalyticsReport } from "@/components/reports/EventAnalyticsReport";
import { AppLayout } from "@/components/layout/AppLayout";

export default function EventAnalyticsReportPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <EventAnalyticsReport />
      </div>
    </AppLayout>
  );
}