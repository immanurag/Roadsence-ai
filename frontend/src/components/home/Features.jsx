import { BarChart3, MapPinned, Gauge, BookOpenText, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    text: "Severity breakdowns, hourly and yearly trends, and condition cross-tabs pulled live from the API.",
    to: "/dashboard",
    cta: "Open dashboard",
    tone: "from-brand-500 to-brand-600",
  },
  {
    icon: MapPinned,
    title: "Hotspot explorer",
    text: "Interactive map of DBSCAN-detected hotspots, ranked by risk score with drill-down detail.",
    to: "/hotspots",
    cta: "View hotspots",
    tone: "from-mint-400 to-mint-500",
  },
  {
    icon: Gauge,
    title: "Risk predictor",
    text: "Describe the conditions — time, weather, road type — and get a severity-risk estimate instantly, with an AI-generated plain-language explanation.",
    to: "/predict",
    cta: "Try the predictor",
    tone: "from-coral-400 to-coral-500",
    aiBadge: true,
  },
  {
    icon: BookOpenText,
    title: "Developer docs",
    text: "Every endpoint, request shape, and response schema documented with copy-paste examples.",
    to: "/docs",
    cta: "Read the docs",
    tone: "from-brand-400 to-mint-400",
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

export default function Features() {
  return (
    <section className="py-24 px-6 bg-white/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <p className="text-sm font-semibold text-brand-600 mb-3">Explore the platform</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink-900">
            Four ways to look at the same data
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map(({ icon: Icon, title, text, to, cta, tone, aiBadge }) => (
            <motion.div key={title} variants={item}>
              <Link to={to} className="group glossy-card card-hover relative rounded-2xl p-6 flex flex-col h-full">
                {aiBadge && (
                  <span className="ai-badge absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white">
                    <Sparkles size={10} />
                    AI-explained
                  </span>
                )}
                <span className={`inline-grid place-items-center w-11 h-11 rounded-xl bg-linear-to-br ${tone} text-white mb-5 shadow-glossy`}>
                  <Icon size={20} />
                </span>
                <h3 className="font-semibold text-ink-900 mb-2">{title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed grow">{text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  {cta}
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
