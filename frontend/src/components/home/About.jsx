import { Database, Cpu, Map, Code2 } from "lucide-react";
import { motion } from "framer-motion";

const PILLARS = [
  {
    icon: Database,
    title: "Clean, real data",
    text: "We ingest raw accident records, drop invalid coordinates and duplicate reports, and engineer time-of-day and peak-hour features — all documented, none hidden in a notebook.",
  },
  {
    icon: Map,
    title: "Spatial hotspot detection",
    text: "DBSCAN clusters accidents by location density into named hotspots, each scored on severity mix and volume so the worst intersections surface first.",
  },
  {
    icon: Cpu,
    title: "Explainable risk model",
    text: "A severity-risk classifier trained only on pre-crash conditions (time, weather, road type, lighting) predicts risk before an accident happens, not after.",
  },
  {
    icon: Code2,
    title: "Built to integrate",
    text: "Every insight on this site is one documented REST call away — the same API this dashboard uses is open for your own apps, dashboards, or research.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-14"
        >
          <p className="text-sm font-semibold text-brand-600 mb-3">What we do</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
            One pipeline, from raw CSV to a risk score you can query.
          </h2>
          <p className="mt-4 text-ink-600 leading-relaxed">
            UrbanRisk Intelligence is an end-to-end road-safety analytics platform.
            It cleans historical accident data, finds where and when crashes cluster,
            explains what conditions drive severity, and exposes all of it through a
            documented API — so the analysis doesn't stop at a chart.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 gap-5"
        >
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} variants={item} className="glossy-card card-hover rounded-2xl p-6">
              <span className="inline-grid place-items-center w-11 h-11 rounded-xl bg-linear-to-br from-brand-500/10 to-mint-400/10 text-brand-600 mb-4">
                <Icon size={20} />
              </span>
              <h3 className="font-semibold text-ink-900 mb-1.5">{title}</h3>
              <p className="text-sm text-ink-600 leading-relaxed">{text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
