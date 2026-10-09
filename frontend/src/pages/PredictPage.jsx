import { useState } from "react";
import { Gauge, Sparkles } from "lucide-react";
import RiskForm from "../components/predict/RiskForm";
import RiskResult from "../components/predict/RiskResult";
import AIInsightPanel from "../components/predict/AIInsightPanel";
import { PageHeader } from "./DashboardPage";

export default function PredictPage() {
  const [result, setResult] = useState(null);
  const [conditions, setConditions] = useState(null);
  const [hoveredFactor, setHoveredFactor] = useState(null);

  const handleResult = (prediction, submittedConditions) => {
    setResult(prediction);
    setConditions(submittedConditions);
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
      <PageHeader
        icon={Gauge}
        title="Risk predictor"
        subtitle="Describe the pre-crash conditions at a location and time — the model estimates severity risk from historical patterns, and Gemini explains what it means in plain language."
        badge={
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white ai-badge px-2.5 py-1 rounded-full">
            <Sparkles size={11} /> Gen AI powered
          </span>
        }
      />

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3">
          <RiskForm onResult={handleResult} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <RiskResult result={result} hoveredFactor={hoveredFactor} onHoverFactor={setHoveredFactor} />
          <AIInsightPanel
            conditions={conditions}
            prediction={result}
            hoveredFactor={hoveredFactor}
            onHoverFactor={setHoveredFactor}
          />
        </div>
      </div>
    </div>
  );
}
