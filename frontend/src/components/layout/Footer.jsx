import { ShieldHalf, GitBranch, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white/60">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center w-7 h-7 rounded-lg bg-linear-to-br from-brand-500 to-mint-400 text-white">
            <ShieldHalf size={14} />
          </span>
          <span className="text-sm text-ink-600">
            &copy; {new Date().getFullYear()} UrbanRisk Intelligence — built for road-safety analytics.
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-ai-600 bg-ai-100 px-2 py-0.5 rounded-full ml-1">
            <Sparkles size={10} /> Predictions explained by Gemini
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm text-ink-600">
          <Link to="/docs" className="hover:text-brand-600 transition-colors">Docs</Link>
          <a href="mailto:hello@urbanrisk.dev" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <Mail size={14} /> Contact
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-brand-600 transition-colors">
            <GitBranch size={14} /> Source
          </a>
        </div>
      </div>
    </footer>
  );
}
