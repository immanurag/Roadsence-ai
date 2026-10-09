import clsx from "clsx";
import { motion } from "framer-motion";
import { Gauge, Lightbulb, ListTree } from "lucide-react";
import { RISK_BADGE_CLASSES, riskColor } from "../../utils/riskColor";
import { severityIcon } from "../../utils/conditionIcons";

const RISK_EXPLANATIONS = {
  Low: "Historically, similar conditions rarely led to a serious accident.",
  Moderate: "Some real risk here — comparable conditions produced a mix of outcomes.",
  High: "Similar conditions have often led to serious or fatal accidents in this data.",
  Critical: "Among the riskiest condition combinations seen in this dataset.",
};

export default function RiskResult({ result, hoveredFactor, onHoverFactor }) {
  if (!result) {
    return (
      <div className="glossy-card rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center gap-3 text-ink-400">
        <Gauge size={28} />
        <p className="text-sm max-w-55">Fill in the conditions and estimate risk to see a result here.</p>
      </div>
    );
  }

  const pct = Math.round(result.severe_probability * 100);
  const SeverityIcon = severityIcon(result.predicted_severity_label);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glossy-card rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-ink-600">Risk estimate</p>
        <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full", RISK_BADGE_CLASSES[result.risk_level])}>
          {result.risk_level} risk
        </span>
      </div>

      <div className="flex flex-col items-center mb-5">
        <div
          className="relative w-32 h-32 rounded-full grid place-items-center"
          style={{
            background: `conic-gradient(${riskColor(result.risk_level)} ${pct * 3.6}deg, #f0eaf7 0deg)`,
          }}
        >
          <div className="w-24 h-24 rounded-full bg-white grid place-items-center flex-col">
            <p className="text-2xl font-bold text-ink-900">{pct}%</p>
            <p className="text-[10px] text-ink-400 -mt-0.5">severe chance</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-sm text-ink-700">
          <SeverityIcon size={15} style={{ color: riskColor(result.risk_level) }} />
          Most likely outcome: <span className="font-semibold">{result.predicted_severity_label}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-ink-600 bg-brand-500/5 rounded-xl px-3.5 py-2.5 mb-6">
        <Lightbulb size={14} className="text-brand-500 shrink-0 mt-0.5" />
        <span>{RISK_EXPLANATIONS[result.risk_level]}</span>
      </div>

      <div>
        <p className="text-xs font-semibold text-ink-600 mb-3 flex items-center gap-1.5">
          <ListTree size={13} /> What influenced this estimate most
        </p>
        <div className="space-y-2.5">
          {result.top_factors.map((f, i) => {
            const active = hoveredFactor === f.feature;
            return (
              <div
                key={f.feature}
                onMouseEnter={() => onHoverFactor?.(f.feature)}
                onMouseLeave={() => onHoverFactor?.(null)}
                className={clsx(
                  "rounded-lg px-2 py-1.5 -mx-2 transition-colors cursor-default",
                  active && "bg-ai-100/70"
                )}
              >
                <div className="flex justify-between items-center text-xs text-ink-600 mb-1 gap-2">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={clsx(
                        "shrink-0 grid place-items-center w-4.5 h-4.5 rounded-full text-[9px] font-bold text-white transition-transform",
                        active ? "scale-125" : "",
                        "bg-linear-to-br from-brand-400 to-mauve-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="truncate capitalize">{f.feature.replaceAll("_", " ")}</span>
                  </span>
                  <span className="shrink-0">{(f.contribution * 100).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-brand-400 to-mauve-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, f.contribution * 400)}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-ink-400 mt-3">
          These are the factors the model relies on most in general. Hover a
          row, or see the AI insight below, for what it means for this
          specific scenario.
        </p>
      </div>
    </motion.div>
  );
}
