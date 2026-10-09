import { BarChart3 } from "lucide-react";
import SeverityChart from "../components/dashboard/SeverityChart";
import HourlyChart from "../components/dashboard/HourlyChart";
import MonthlyTrendChart from "../components/dashboard/MonthlyTrendChart";
import DimensionExplorer from "../components/dashboard/DimensionExplorer";
import LeadingCauses from "../components/dashboard/LeadingCauses";

export default function DashboardPage() {
  return (
    <div className="relative pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 mesh-grid -z-10" />

      <PageHeader
        icon={BarChart3}
        title="Analytics dashboard"
        subtitle="Plain-language breakdowns of every recorded accident — hover any chart for exact numbers, and read the light-bulb tips for what each one actually means."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7 items-start">
        <HourlyChart />
        <SeverityChart />
        <MonthlyTrendChart />
        <DimensionExplorer />
        <LeadingCauses />
      </div>
    </div>
  );
}

export function PageHeader({ icon: Icon, title, subtitle, badge }) {
  return (
    <div className="mb-10 animate-fade-up">
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-linear-to-br from-brand-500 to-mauve-500 text-white shadow-glossy">
          <Icon size={17} />
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">{title}</h1>
        {badge}
      </div>
      {subtitle && <p className="text-ink-600 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
