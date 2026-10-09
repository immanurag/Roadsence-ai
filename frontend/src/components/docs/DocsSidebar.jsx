const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "accidents", label: "Accidents" },
  { id: "analytics", label: "Analytics" },
  { id: "hotspots", label: "Hotspots" },
  { id: "predict", label: "Predict" },
  { id: "reference", label: "Reference codes" },
  { id: "errors", label: "Errors" },
];

export default function DocsSidebar() {
  return (
    <nav className="hidden lg:block sticky top-32 self-start w-48 shrink-0">
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3">On this page</p>
      <ul className="space-y-1">
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="block px-3 py-1.5 rounded-lg text-sm text-ink-600 hover:text-brand-700 hover:bg-brand-500/5 transition-colors"
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
