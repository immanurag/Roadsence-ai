import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Cloud,
  Gauge,
  Gauge as SpeedIcon,
  Lightbulb,
  Loader2,
  MapPin,
  Milestone,
  Signpost,
  Clock,
  Waves,
} from "lucide-react";
import FormField, { selectClasses } from "./FormField";
import { useApi } from "../../hooks/useApi";
import { referenceApi, predictApi } from "../../api/endpoints";
import { Loading, ErrorState } from "../common/StatusState";

const DEFAULTS = {
  hour: 21,
  day_of_week_code: 6,
  road_type_code: 6,
  speed_limit: 60,
  junction_detail_code: 0,
  junction_control_code: -1,
  light_conditions_code: 6,
  weather_conditions_code: 2,
  road_surface_conditions_code: 2,
  urban_or_rural_area_code: 2,
};

function codeOptions(mapping) {
  return Object.entries(mapping || {}).map(([code, label]) => ({ code: Number(code), label }));
}

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mt-1 mb-3">{children}</p>;
}

export default function RiskForm({ onResult }) {
  const { data: codes, error: codesError, loading: codesLoading } = useApi(() => referenceApi.codes(), []);
  const [form, setForm] = useState(DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: Number(e.target.value) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await predictApi.risk(form);
      onResult(result, form);
    } catch (err) {
      setSubmitError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (codesLoading) return <div className="glossy-card rounded-2xl"><Loading label="Loading condition options…" /></div>;
  if (codesError) return <div className="glossy-card rounded-2xl"><ErrorState error={codesError} /></div>;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onSubmit={handleSubmit}
      className="glossy-card rounded-2xl p-6"
    >
      <p className="text-sm text-ink-600 -mt-1 mb-5">
        Fill in the conditions at a location and time — no need to know exact
        statistics, just describe the situation as you&apos;d see it.
      </p>

      <SectionLabel>When &amp; where</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <FormField label="Hour of day (0-23)" icon={Clock}>
          <input
            type="number" min={0} max={23} value={form.hour} onChange={update("hour")}
            className={selectClasses}
          />
        </FormField>
        <FormField label="Day of week" icon={CalendarDays}>
          <select value={form.day_of_week_code} onChange={update("day_of_week_code")} className={selectClasses}>
            {codeOptions(codes.day_of_week).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Area type" icon={MapPin}>
          <select value={form.urban_or_rural_area_code} onChange={update("urban_or_rural_area_code")} className={selectClasses}>
            {codeOptions(codes.urban_or_rural_area).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Speed limit (mph)" icon={SpeedIcon}>
          <input
            type="number" min={0} max={130} step={5} value={form.speed_limit} onChange={update("speed_limit")}
            className={selectClasses}
          />
        </FormField>
      </div>

      <SectionLabel>Road &amp; junction</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <FormField label="Road type" icon={Milestone}>
          <select value={form.road_type_code} onChange={update("road_type_code")} className={selectClasses}>
            {codeOptions(codes.road_type).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Junction detail" icon={Signpost}>
          <select value={form.junction_detail_code} onChange={update("junction_detail_code")} className={selectClasses}>
            {codeOptions(codes.junction_detail).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Junction control" icon={Signpost}>
          <select value={form.junction_control_code} onChange={update("junction_control_code")} className={selectClasses}>
            {codeOptions(codes.junction_control).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
      </div>

      <SectionLabel>Environment</SectionLabel>
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Light conditions" icon={Lightbulb}>
          <select value={form.light_conditions_code} onChange={update("light_conditions_code")} className={selectClasses}>
            {codeOptions(codes.light_conditions).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Weather conditions" icon={Cloud}>
          <select value={form.weather_conditions_code} onChange={update("weather_conditions_code")} className={selectClasses}>
            {codeOptions(codes.weather_conditions).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
        <FormField label="Road surface conditions" icon={Waves}>
          <select value={form.road_surface_conditions_code} onChange={update("road_surface_conditions_code")} className={selectClasses}>
            {codeOptions(codes.road_surface_conditions).map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
          </select>
        </FormField>
      </div>

      {submitError && <p className="text-sm text-coral-500 mt-5">{submitError.message}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-glossy hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Gauge size={16} />}
        {submitting ? "Scoring…" : "Estimate risk"}
      </button>
    </motion.form>
  );
}
