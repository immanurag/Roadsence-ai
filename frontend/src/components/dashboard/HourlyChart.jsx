import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock } from "lucide-react";
import ChartCard from "./ChartCard";
import { useApi } from "../../hooks/useApi";
import { analyticsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";
import { chartColors } from "../../utils/chartColors";

function formatHour(hour) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3.5 py-2.5 text-xs shadow-island">
      <p className="font-display font-semibold text-ink-900 mb-1.5">{formatHour(label)}</p>
      {payload
        .slice()
        .reverse()
        .map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-600">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-medium text-ink-900">{p.value.toLocaleString()}</span>
          </div>
        ))}
    </div>
  );
}

function Legend() {
  const items = [
    { key: "slight", label: "Slight", color: chartColors.slight },
    { key: "serious", label: "Serious", color: chartColors.serious },
    { key: "fatal", label: "Fatal", color: chartColors.fatal },
  ];
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map((item) => (
        <span key={item.key} className="flex items-center gap-1.5 text-xs text-ink-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function HourlyChart() {
  const { data, error, loading } = useApi(() => analyticsApi.hourly(), []);

  const peakHour = data ? data.reduce((max, d) => (d.count > max.count ? d : max), data[0]) : null;

  return (
    <ChartCard
      icon={Clock}
      title="What time of day is riskiest?"
      subtitle="Accidents across the 24-hour clock, split by how serious they were"
      hint={peakHour ? `Traffic peaks around ${formatHour(peakHour.hour)} — that's also when total accidents are highest, which tracks with rush-hour congestion.` : undefined}
      className="col-span-full lg:col-span-2"
      action={data ? <Legend /> : undefined}
    >
      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {data && (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="slightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.slight} stopOpacity={0.45} />
                <stop offset="100%" stopColor={chartColors.slight} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="seriousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.serious} stopOpacity={0.5} />
                <stop offset="100%" stopColor={chartColors.serious} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fatalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.fatal} stopOpacity={0.6} />
                <stop offset="100%" stopColor={chartColors.fatal} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chartColors.grid} strokeDasharray="3 6" />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => (h % 6 === 0 ? formatHour(h) : "")}
              interval={0}
              tick={{ fontSize: 11, fill: chartColors.ink }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartColors.brandLight, strokeWidth: 1, strokeDasharray: "4 4" }} />
            {peakHour && (
              <ReferenceLine
                x={peakHour.hour}
                stroke={chartColors.brand}
                strokeDasharray="4 4"
                label={{ value: "Peak", position: "insideTopRight", fontSize: 11, fill: chartColors.brand }}
              />
            )}
            <Area
              type="monotone"
              dataKey="slight_count"
              name="Slight"
              stackId="1"
              stroke={chartColors.slight}
              fill="url(#slightGradient)"
              strokeWidth={2}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="serious_count"
              name="Serious"
              stackId="1"
              stroke={chartColors.serious}
              fill="url(#seriousGradient)"
              strokeWidth={2}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
            <Area
              type="monotone"
              dataKey="fatal_count"
              name="Fatal"
              stackId="1"
              stroke={chartColors.fatal}
              fill="url(#fatalGradient)"
              strokeWidth={2}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
