import { RISK_COLORS } from "../../utils/riskColor";

const DESCRIPTIONS = {
  Low: "Few accidents, mostly minor",
  Moderate: "Worth a second look",
  High: "Frequent or severe accidents",
  Critical: "Highest concentration of severe/fatal accidents",
};

export default function RiskLegend() {
  return (
    <div className="glass-panel rounded-xl shadow-glossy px-4 py-3 flex flex-wrap gap-x-5 gap-y-2 max-w-full">
      {Object.entries(RISK_COLORS).map(([level, color]) => (
        <div key={level} className="flex items-center gap-2" title={DESCRIPTIONS[level]}>
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/70"
            style={{ backgroundColor: color }}
          />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-ink-900">{level}</p>
            <p className="text-[10px] text-ink-500 hidden sm:block">{DESCRIPTIONS[level]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
