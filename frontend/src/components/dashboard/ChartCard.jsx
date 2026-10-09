import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

export default function ChartCard({ title, subtitle, hint, action, icon: Icon, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`glossy-card card-hover rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="flex items-start gap-2.5">
          {Icon && (
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-linear-to-br from-brand-500/15 to-mauve-400/15 text-brand-600 shrink-0 mt-0.5 ring-1 ring-brand-500/10">
              <Icon size={16} />
            </span>
          )}
          <div>
            <h3 className="font-display font-semibold text-ink-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
      {hint && (
        <div className="mt-4 flex items-start gap-2 text-xs text-ink-600 bg-linear-to-r from-brand-500/8 to-mauve-400/5 border border-brand-500/10 rounded-xl px-3.5 py-2.5">
          <Lightbulb size={14} className="text-brand-500 shrink-0 mt-0.5" />
          <span>{hint}</span>
        </div>
      )}
    </motion.div>
  );
}
