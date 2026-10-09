import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import ChartCard from "./ChartCard";
import { useApi } from "../../hooks/useApi";
import { analyticsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";
import { categoricalColor, chartColors } from "../../utils/chartColors";
import { conditionIconFor } from "../../utils/conditionIcons";

const DIMENSIONS = [
  { key: "weather", label: "Weather" },
  { key: "road_surface", label: "Road surface" },
  { key: "light", label: "Light conditions" },
  { key: "road_type", label: "Road type" },
  { key: "urban_rural", label: "Urban / rural" },
  { key: "junction_detail", label: "Junction detail" },
  { key: "time_of_day", label: "Time of day" },
];

function IconTick({ x, y, payload, dimension }) {
  const Icon = conditionIconFor(dimension, payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      {Icon && (
        <foreignObject x={-158} y={-9} width={18} height={18}>
          <Icon size={14} color={chartColors.ink} />
        </foreignObject>
      )}
      <text x={Icon ? -136 : -140} y={0} dy={4} textAnchor="start" fontSize={11} fill={chartColors.ink}>
        {payload.value}
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="glass-panel rounded-xl px-3.5 py-2.5 text-xs shadow-island">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span className="font-display font-semibold text-ink-900">{entry.payload.label}</span>
      </div>
      <p className="text-ink-600">
        <span className="font-medium text-ink-900">{entry.value.toLocaleString()}</span> accidents
      </p>
    </div>
  );
}

export default function DimensionExplorer() {
  const [dimension, setDimension] = useState("weather");
  const { data, error, loading } = useApi(() => analyticsApi.byDimension(dimension), [dimension]);

  return (
    <ChartCard
      icon={SlidersHorizontal}
      title="Which conditions show up most?"
      subtitle="Pick a factor to see how often accidents happen under each condition"
      hint="A tall bar here doesn't automatically mean a condition is dangerous — clear, dry weather has the most accidents simply because most driving happens in clear, dry weather. Compare this against the risk predictor to see which conditions raise risk per trip, not just in total count."
      className="col-span-full"
      action={
        <div className="relative">
          <select
            value={dimension}
            onChange={(e) => setDimension(e.target.value)}
            className="appearance-none text-sm bg-white border border-ink-100 rounded-lg pl-3 pr-8 py-1.5 text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-300 cursor-pointer transition-shadow hover:shadow-glossy"
          >
            {DIMENSIONS.map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
        </div>
      }
    >
      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {data && (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid horizontal={false} stroke={chartColors.grid} strokeDasharray="3 6" />
            <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="label"
              width={160}
              tick={<IconTick dimension={dimension} />}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(157,95,212,0.06)" }} />
            <Bar
              dataKey="count"
              name="Accidents"
              radius={[0, 8, 8, 0]}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((entry, i) => (
                <Cell key={entry.label} fill={categoricalColor(i)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
