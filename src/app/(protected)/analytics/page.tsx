import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata = { title: "Analytics | CRNA Board Study" };

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <AnalyticsDashboard />
    </div>
  );
}
