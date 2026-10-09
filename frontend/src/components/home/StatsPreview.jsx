import { useEffect, useRef, useState } from "react";
import { AlertOctagon, Ambulance, MapPinned, ShieldAlert } from "lucide-react";
import { motion, useInView, animate } from "framer-motion";
import { useApi } from "../../hooks/useApi";
import { analyticsApi, hotspotsApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

function CountUp({ value, duration = 1.4 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);
  const target = Number(String(value).replace(/[^0-9.-]/g, "")) || 0;

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, target, duration]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

export default function StatsPreview() {
  const severity = useApi(() => analyticsApi.severity(), []);
  const hotspots = useApi(() => hotspotsApi.list(1, 1000), []);

  if (severity.loading || hotspots.loading) return <Loading label="Loading live stats…" />;
  if (severity.error || hotspots.error) return <ErrorState error={severity.error || hotspots.error} />;

  const bySeverity = Object.fromEntries(severity.data.breakdown.map((b) => [b.label, b.count]));
  const criticalHotspots = hotspots.data.filter((h) => h.risk_level === "Critical" || h.risk_level === "High").length;

  const cards = [
    { icon: ShieldAlert, label: "Total accidents", value: severity.data.total, tone: "brand" },
    { icon: AlertOctagon, label: "Fatal accidents", value: bySeverity.Fatal ?? 0, tone: "coral" },
    { icon: Ambulance, label: "Serious accidents", value: bySeverity.Serious ?? 0, tone: "amber" },
    { icon: MapPinned, label: "High / critical hotspots", value: criticalHotspots, tone: "brand" },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {cards.map(({ icon: Icon, label, value, tone }) => (
            <motion.div key={label} variants={item} className="glossy-card card-hover rounded-2xl p-6">
              <span
                className={`inline-grid place-items-center w-10 h-10 rounded-xl mb-4 ${
                  tone === "coral" ? "bg-coral-500/10 text-coral-500" : tone === "amber" ? "bg-amber-400/20 text-amber-500" : "bg-brand-500/10 text-brand-600"
                }`}
              >
                <Icon size={18} />
              </span>
              <p className="text-2xl font-bold text-ink-900 tabular-nums">
                <CountUp value={value} />
              </p>
              <p className="text-sm text-ink-400 mt-1">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
