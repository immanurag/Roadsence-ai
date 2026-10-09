import { motion } from "framer-motion";
import clsx from "clsx";
import { RISK_BADGE_CLASSES, riskColor } from "../../utils/riskColor";

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function HotspotList({ hotspots, selectedId, onSelect }) {
  return (
    <div className="glossy-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ink-100">
        <h3 className="font-display font-semibold text-ink-900 text-sm">Ranked hotspots</h3>
        <p className="text-xs text-ink-400">{hotspots.length} clusters, sorted by risk score</p>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="max-h-[440px] overflow-y-auto scrollbar-thin"
      >
        {hotspots.map((h, i) => {
          const isSelected = h.hotspot_id === selectedId;
          return (
            <motion.button
              key={h.hotspot_id}
              variants={rowVariants}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(h.hotspot_id)}
              className={clsx(
                "relative w-full text-left pl-6 pr-5 py-3.5 border-b border-ink-50 flex items-center justify-between gap-3 transition-colors",
                isSelected ? "bg-brand-500/8" : "hover:bg-ink-50"
              )}
            >
              <span
                className={clsx(
                  "absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-opacity duration-300",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
                style={{ backgroundColor: riskColor(h.risk_level) }}
              />
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[11px] font-mono text-ink-400 w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className={clsx("text-sm font-medium truncate", isSelected ? "text-brand-700" : "text-ink-900")}>
                    Hotspot #{h.hotspot_id}
                  </p>
                  <p className="text-xs text-ink-400">{h.accident_count} accidents · {h.fatal_count} fatal</p>
                </div>
              </div>
              <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full shrink-0", RISK_BADGE_CLASSES[h.risk_level])}>
                {h.risk_level}
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
