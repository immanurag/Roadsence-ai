import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CalendarDays } from "lucide-react";
import ChartCard from "./ChartCard";
import { useApi } from "../../hooks/useApi";
import { analyticsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";
import { chartColors } from "../../utils/chartColors";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3.5 py-2.5 text-xs shadow-island">
      <p className="font-display font-semibold text-ink-900 mb-1">{label}</p>
      <p className="text-ink-600">
        <span className="font-medium text-ink-900">{payload[0].value.toLocaleString()}</span> accidents
      </p>
    </div>
  );
}

export default function MonthlyTrendChart() {
  const { data, error, loading } = useApi(() => analyticsApi.monthly(), []);

  const busiest = data ? data.reduce((max, d) => (d.count > max.count ? d : max), data[0]) : null;

  return (
    <ChartCard
      icon={CalendarDays}
      title="Does the season matter?"
      subtitle="Total accidents by month, across the year"
      hint={busiest ? `${busiest.month_label} sees the most accidents. Seasonal shifts like this often line up with weather, daylight hours, or holiday travel.` : undefined}
    >
      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {data && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="monthlyBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.brand} stopOpacity={0.95} />
                <stop offset="100%" stopColor={chartColors.brand} stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="monthlyBarGradientActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.mauve} stopOpacity={1} />
                <stop offset="100%" stopColor={chartColors.brand} stopOpacity={0.75} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 6" />
            <XAxis dataKey="month_label" tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(157,95,212,0.06)" }}
              content={<CustomTooltip />}
            />
            <Bar
              dataKey="count"
              name="Accidents"
              fill="url(#monthlyBarGradient)"
              radius={[8, 8, 0, 0]}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              activeBar={{ fill: "url(#monthlyBarGradientActive)" }}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
