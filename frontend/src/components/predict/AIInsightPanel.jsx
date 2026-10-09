import { useEffect, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { predictApi } from "../../api/endpoints";

const SEVERITY_DOT = {
  low: "bg-mint-500",
  medium: "bg-amber-500",
  high: "bg-coral-600",
};

export default function AIInsightPanel({ conditions, prediction, hoveredFactor, onHoverFactor }) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  useEffect(() => {
    if (!conditions || !prediction) return;
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });

    predictApi
      .insight({ conditions, prediction })
      .then((data) => {
        if (!cancelled) setState({ status: "success", data, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", data: null, error: err });
      });

    return () => {
      cancelled = true;
    };
  }, [conditions, prediction]);

  const factorIndex = prediction
    ? Object.fromEntries(prediction.top_factors.map((f, i) => [f.feature, i + 1]))
    : {};

  return (
    <div className="ai-card rounded-2xl p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-ai-400/10 blur-3xl" />

      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className={clsx("grid place-items-center w-7 h-7 rounded-lg text-white ai-badge", state.status === "loading" && "ai-ring")}>
            <Sparkles size={14} />
          </span>
          <p className="text-sm font-semibold text-ink-800">AI insight</p>
        </div>
        <span className="text-[11px] font-medium text-ai-600 bg-ai-100 px-2.5 py-1 rounded-full">Gemini 2.5 Flash</span>
      </div>

      <AnimatePresence mode="wait">
        {state.status === "idle" && (
          <motion.p key="idle" exit={{ opacity: 0 }} className="text-sm text-ink-400 py-6 text-center">
            Estimate a risk score to get a plain-language explanation, written live by Gemini.
          </motion.p>
        )}

        {state.status === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="h-4 w-3/4 rounded-full shimmer" />
            <div className="h-3 w-full rounded-full shimmer" />
            <div className="h-3 w-5/6 rounded-full shimmer" />
            <div className="pt-2 space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-8 w-full rounded-xl shimmer" />
              ))}
            </div>
          </motion.div>
        )}

        {state.status === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2.5 text-sm text-ink-600 bg-amber-400/10 rounded-xl px-3.5 py-3">
            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <span>
              The AI explanation isn&apos;t available right now
              {state.error?.message ? ` (${state.error.message})` : ""}. The
              numeric estimate above is unaffected.
            </span>
          </motion.div>
        )}

        {state.status === "success" && state.data && (
          <motion.div key="success" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-5">
            <p className="text-[15px] font-semibold text-ink-900 leading-snug">{state.data.headline}</p>
            <p className="text-sm text-ink-600 leading-relaxed">{state.data.narrative}</p>

            <div>
              <p className="text-xs font-semibold text-ink-600 mb-2.5">Why, point by point</p>
              <div className="space-y-1.5">
                {state.data.key_points.map((point, i) => {
                  const active = hoveredFactor === point.factor;
                  const num = factorIndex[point.factor] ?? i + 1;
                  return (
                    <div
                      key={`${point.factor}-${i}`}
                      onMouseEnter={() => onHoverFactor?.(point.factor)}
                      onMouseLeave={() => onHoverFactor?.(null)}
                      className={clsx(
                        "flex items-start gap-2.5 rounded-lg px-2 py-1.5 -mx-2 transition-colors cursor-default",
                        active && "bg-ai-100/70"
                      )}
                    >
                      <span
                        className={clsx(
                          "shrink-0 mt-0.5 grid place-items-center w-4.5 h-4.5 rounded-full text-[9px] font-bold text-white transition-transform",
                          active && "scale-125",
                          "bg-linear-to-br from-brand-400 to-mauve-500"
                        )}
                      >
                        {num}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-semibold text-ink-800">{point.label}</span>
                          <span className={clsx("w-1.5 h-1.5 rounded-full", SEVERITY_DOT[point.severity] || SEVERITY_DOT.medium)} />
                        </span>
                        <span className="text-xs text-ink-600 leading-relaxed">{point.explanation}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-ink-600 mb-2.5">What would reduce this risk</p>
              <ul className="space-y-2">
                {state.data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-ink-600">
                    <CheckCircle2 size={14} className="text-ai-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
