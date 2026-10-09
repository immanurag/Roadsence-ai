import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import ChartCard from "./ChartCard";
import { useApi } from "../../hooks/useApi";
import { analyticsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";
import { weatherIcon, surfaceIcon, lightIcon } from "../../utils/conditionIcons";
import { categoricalColor } from "../../utils/chartColors";

export default function LeadingCauses() {
  const { data, error, loading } = useApi(() => analyticsApi.leadingCauses(6), []);

  const maxCount = data ? Math.max(...data.map((c) => c.severe_accident_count)) : 1;

  return (
    <ChartCard
      icon={ListChecks}
      title="What do serious crashes have in common?"
      subtitle="The most frequent weather + road surface + lighting combinations among Fatal and Serious accidents"
      hint="This isn't a single 'cause' field from the data — it's the most common combination of conditions present when a serious crash happened. Treat it as a pattern to watch for, not a guaranteed trigger."
      className="col-span-full"
    >
      {loading && <Loading />}
      {error && <ErrorState error={error} />}
      {data && (
        <div className="space-y-2">
          {data.map((cause, i) => {
            const WeatherIcon = weatherIcon(cause.weather);
            const SurfaceIcon = surfaceIcon(cause.road_surface);
            const LightIcon = lightIcon(cause.light);
            const color = categoricalColor(i);
            const widthPct = Math.max(6, (cause.severe_accident_count / maxCount) * 100);
            return (
              <motion.div
                key={`${cause.weather}-${cause.road_surface}-${cause.light}`}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex items-center gap-4 rounded-xl border border-ink-100 px-4 py-3 overflow-hidden hover:border-brand-500/25 hover:shadow-glossy transition-all duration-300"
              >
                <div
                  className="absolute inset-y-0 left-0 opacity-[0.07] transition-all duration-500 group-hover:opacity-[0.12]"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
                <span
                  className="relative grid place-items-center w-7 h-7 rounded-full text-xs font-bold text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                >
                  {i + 1}
                </span>
                <div className="relative flex flex-wrap items-center gap-x-4 gap-y-1 flex-1 min-w-0">
                  <span className="flex items-center gap-1.5 text-sm text-ink-700">
                    <WeatherIcon size={14} className="text-ink-400" /> {cause.weather}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-ink-700">
                    <SurfaceIcon size={14} className="text-ink-400" /> {cause.road_surface}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-ink-700">
                    <LightIcon size={14} className="text-ink-400" /> {cause.light}
                  </span>
                </div>
                <span className="relative text-sm font-semibold text-coral-500 shrink-0">
                  {cause.severe_accident_count.toLocaleString()} severe
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </ChartCard>
  );
}
