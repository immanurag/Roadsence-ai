import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import clsx from "clsx";
import { useApi } from "../../hooks/useApi";
import { hotspotsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";
import { RISK_BADGE_CLASSES, riskColor } from "../../utils/riskColor";
import { weatherIcon, surfaceIcon } from "../../utils/conditionIcons";

const panelMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
};

export default function HotspotDetailPanel({ hotspotId }) {
  const { data, error, loading } = useApi(
    () => (hotspotId ? hotspotsApi.get(hotspotId) : Promise.resolve(null)),
    [hotspotId]
  );

  return (
    <AnimatePresence mode="wait">
      {!hotspotId && (
        <motion.div
          key="empty"
          {...panelMotion}
          className="glossy-card rounded-2xl p-6 h-full min-h-[220px] flex items-center justify-center text-center text-sm text-ink-400"
        >
          Select a hotspot on the map or in the list to see its detail.
        </motion.div>
      )}

      {hotspotId && loading && (
        <motion.div key="loading" {...panelMotion} className="glossy-card rounded-2xl">
          <Loading />
        </motion.div>
      )}

      {hotspotId && !loading && error && (
        <motion.div key="error" {...panelMotion} className="glossy-card rounded-2xl">
          <ErrorState error={error} />
        </motion.div>
      )}

      {hotspotId && !loading && !error && data && (
        <motion.div key={data.hotspot_id} {...panelMotion} className="glossy-card rounded-2xl p-6 relative overflow-hidden">
          <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: riskColor(data.risk_level) }} />

          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-ink-400 flex items-center gap-1"><MapPin size={12} /> Hotspot #{data.hotspot_id}</p>
              <p className="text-sm text-ink-600 mt-0.5">{data.center_latitude.toFixed(4)}, {data.center_longitude.toFixed(4)}</p>
            </div>
            <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full", RISK_BADGE_CLASSES[data.risk_level])}>
              {data.risk_level} risk
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <MiniStat label="Total" value={data.accident_count} />
            <MiniStat label="Fatal" value={data.fatal_count} tone="coral" />
            <MiniStat label="Serious" value={data.serious_count} tone="amber" />
          </div>

          <div className="flex items-center gap-2 text-sm text-ink-700 mb-5 bg-brand-500/5 rounded-xl px-3.5 py-2.5">
            <Clock size={14} className="text-brand-600 shrink-0" />
            Peak risk window: <span className="font-semibold">{data.peak_hour_range}</span>
          </div>

          <DetailList title="Top weather at time of crash" items={data.top_weather} iconFor={weatherIcon} />
          <DetailList title="Top road surface conditions" items={data.top_road_surface} iconFor={surfaceIcon} className="mt-4" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MiniStat({ label, value, tone }) {
  const toneClass = tone === "coral" ? "text-coral-500" : tone === "amber" ? "text-amber-500" : "text-ink-900";
  return (
    <div className="rounded-xl border border-ink-100 px-3 py-2.5 text-center transition-colors hover:border-brand-200">
      <p className={clsx("text-lg font-bold", toneClass)}>{value}</p>
      <p className="text-[11px] text-ink-400">{label}</p>
    </div>
  );
}

function DetailList({ title, items, iconFor, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs font-semibold text-ink-600 mb-2">{title}</p>
      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = iconFor?.(item.label);
          return (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-ink-700">
                {Icon && <Icon size={13} className="text-ink-400" />}
                {item.label}
              </span>
              <span className="text-ink-400">{item.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
