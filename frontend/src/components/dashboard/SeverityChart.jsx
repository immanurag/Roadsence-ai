import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import ChartCard from "./ChartCard";
import { useApi } from "../../hooks/useApi";
import { analyticsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";
import { severityColor } from "../../utils/chartColors";
import { severityIcon } from "../../utils/conditionIcons";

function CustomTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const pct = total ? ((entry.value / total) * 100).toFixed(1) : 0;
  return (
    <div className="glass-panel rounded-xl px-3.5 py-2.5 text-xs shadow-island">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span className="font-display font-semibold text-ink-900">{entry.name}</span>
      </div>
      <p className="text-ink-600">
        <span className="font-medium text-ink-900">{entry.value.toLocaleString()}</span> accidents · {pct}%
      </p>
    </div>
  );
}

export default function SeverityChart() {
  const { data, error, loading } = useApi(() => analyticsApi.severity(), []);
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <ChartCard
      icon={PieChartIcon}
      title="How severe are accidents, overall?"
      subtitle="Every recorded accident, grouped by outcome"
      hint="Most accidents are minor ('Slight') — but even a small green slice of Fatal accidents represents real lives, which is why the risk model and hotspot scores weigh severity heavily, not just accident count."
    >
      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={220} className="sm:max-w-55">
            <PieChart>
              <defs>
                {data.breakdown.map((entry) => (
                  <filter key={`shadow-${entry.label}`} id={`pieShadow-${entry.label}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={severityColor(entry.label)} floodOpacity="0.35" />
                  </filter>
                ))}
              </defs>
              <Pie
                data={data.breakdown}
                dataKey="count"
                nameKey="label"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                cornerRadius={6}
                strokeWidth={0}
                isAnimationActive
                animationDuration={800}
                animationEasing="ease-out"
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.breakdown.map((entry, i) => (
                  <Cell
                    key={entry.label}
                    fill={severityColor(entry.label)}
                    style={{
                      filter: activeIndex === i ? `url(#pieShadow-${entry.label})` : undefined,
                      opacity: activeIndex === null || activeIndex === i ? 1 : 0.45,
                      transition: "opacity 0.2s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip total={data.total} />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 w-full space-y-3">
            {data.breakdown.map((entry, i) => {
              const Icon = severityIcon(entry.label);
              const pct = ((entry.count / data.total) * 100).toFixed(1);
              const isActive = activeIndex === i;
              return (
                <div
                  key={entry.label}
                  className="flex items-center gap-3 rounded-lg -mx-1.5 px-1.5 py-1 transition-colors duration-200"
                  style={{ backgroundColor: isActive ? `${severityColor(entry.label)}12` : "transparent" }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <span
                    className="grid place-items-center w-8 h-8 rounded-lg shrink-0"
                    style={{ backgroundColor: `${severityColor(entry.label)}22`, color: severityColor(entry.label) }}
                  >
                    <Icon size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium text-ink-900">{entry.label}</span>
                      <span className="text-sm font-semibold text-ink-900">{pct}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${pct}%`, backgroundColor: severityColor(entry.label) }}
                      />
                    </div>
                    <p className="text-xs text-ink-400 mt-1">{entry.count.toLocaleString()} accidents</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
